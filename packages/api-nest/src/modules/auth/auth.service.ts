import { KeyManagementServiceClient, protos } from "@google-cloud/kms";
import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  Injectable,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ethers } from "ethers";
import { Role } from "generated/prisma/client";
import { SiweMessage } from "siwe";
import { PrismaService } from "src/database/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import { NonceService } from "./nonce.service";

@Injectable()
export class AuthService {
  private readonly prisma: PrismaService;
  private readonly config: ConfigService;
  private cachedRole: Role | null = null;
  private readonly nonceService: NonceService;
  constructor(
    prisma: PrismaService,
    config: ConfigService,
    nonceService: NonceService
  ) {
    this.prisma = prisma;
    this.config = config;
    this.nonceService = nonceService;
  }

  private async getDefaultRole() {
    if (this.cachedRole) {
      return this.cachedRole;
    }
    const role = await this.prisma.role.findUnique({
      where: { name: "user" },
    });
    if (!role) {
      throw new BadGatewayException("Vai trò mặc định không tồn tại");
    }
    this.cachedRole = role;
    return role;
  }

  async register({
    walletAddress: rawWallet,
    username,
    email,
    signature,
    message,
  }: RegisterDto) {
    const walletAddress = this.normalizeWallet(rawWallet);
    await this.verifySiweMessage(message, signature, walletAddress);
    await this.ensureUnique(walletAddress, email);
    const [role, kmsKeyName] = await Promise.all([
      this.getDefaultRole(),
      this.createKmsKey(walletAddress),
    ]);
    if (!kmsKeyName) {
      throw new BadGatewayException("KMS service không được cấu hình đúng");
    }
    const user = await this.prisma.user.create({
      data: {
        walletAddress,
        username,
        email,
        roleId: role.id,
        kmsKeyName,
      },
      select: {
        id: true,
        walletAddress: true,
        username: true,
        email: true,
        kmsKeyName: true,
      },
    });
    return {
      success: true,
      message: "Đăng ký thành công",
      user,
    };
  }

  private async verifySiweMessage(
    message: string,
    signature: string,
    expectedWalletAddress: string
  ) {
    const siwe = this.parseSiweMessage(message);
    const allowedDomain = this.getAllowedDomain();
    if (siwe.domain !== allowedDomain) {
      throw new BadRequestException("Domain không hợp lệ trong message");
    }

    const entry = await this.nonceService.getNonceFor(expectedWalletAddress);
    if (!entry || entry.nonce !== siwe.nonce) {
      throw new BadRequestException("Nonce không hợp lệ hoặc không tồn tại");
    }

    if (
      siwe.expirationTime &&
      Date.now() > new Date(siwe.expirationTime).getTime()
    ) {
      throw new BadRequestException("SIWE message đã hết hạn");
    }

    await this.performSiweVerification(
      siwe,
      message,
      signature,
      expectedWalletAddress,
      allowedDomain,
      entry.nonce
    );

    this.nonceService.markNonceUsed(expectedWalletAddress);
    return true;
  }

  private parseSiweMessage(message: string): SiweMessage {
    try {
      return new SiweMessage(message);
    } catch {
      throw new BadRequestException("Sai định dạng SIWE message");
    }
  }

  private getAllowedDomain(): string {
    const siweConfig = (this.config.get("siwe") || {}) as Record<
      string,
      unknown
    >;
    const domainFromConfig =
      (siweConfig.registerDomain as string) ||
      this.config.get<string>("REGISTER_DOMAIN");
    return (
      domainFromConfig ||
      this.config.get<string>("domain") ||
      "secure-docs.example.com"
    );
  }

  private async performSiweVerification(
    siwe: SiweMessage,
    message: string,
    signature: string,
    expectedWalletAddress: string,
    allowedDomain: string,
    entryNonce: string
  ) {
    // Use siwe.verify if available, otherwise fallback to ethers
    const siweWithVerify = siwe as unknown as {
      verify?: (opts: {
        signature: string;
        domain?: string;
        nonce?: string;
      }) => Promise<{ success: boolean }>;
    };

    if (typeof siweWithVerify.verify === "function") {
      const result = await siweWithVerify.verify({
        signature,
        domain: allowedDomain,
        nonce: entryNonce,
      });
      if (!result || result.success !== true) {
        throw new BadRequestException("Chữ ký SIWE không hợp lệ");
      }
      return;
    }

    // fallback
    let recovered: string;
    try {
      recovered = ethers.verifyMessage(message, signature);
    } catch {
      throw new BadRequestException("Chữ ký không hợp lệ");
    }
    if (recovered.toLowerCase() !== expectedWalletAddress.toLowerCase()) {
      throw new BadRequestException("Chữ ký không khớp với địa chỉ ví");
    }
  }

  private normalizeWallet(rawWallet: string): string {
    try {
      return ethers.getAddress(rawWallet);
    } catch {
      throw new ConflictException("Địa chỉ ví không hợp lệ");
    }
  }

  private async ensureUnique(walletAddress: string, email: string) {
    const exists = await this.prisma.user.findFirst({
      where: {
        OR: [{ walletAddress }, { email }],
      },
      select: { walletAddress: true, email: true },
    });
    if (!exists) {
      return;
    }
    if (exists.walletAddress === walletAddress) {
      throw new ConflictException("Địa chỉ ví đã được sử dụng");
    }
    if (exists.email === email) {
      throw new ConflictException("Email đã được sử dụng");
    }
  }

  private async createKmsKey(
    walletAddress: string
  ): Promise<string | null | undefined> {
    const kmsConfig = this.config.get("kms");
    const projectId = kmsConfig.gcpProjectId;
    const locationId = kmsConfig.gcpKmsLocation;
    const keyRingId = kmsConfig.gcpKmsKeyRing;
    const client = new KeyManagementServiceClient();
    const keyRingName = client.keyRingPath(projectId, locationId, keyRingId);
    await client.getKeyRing({ name: keyRingName }).catch(() =>
      client.createKeyRing({
        parent: client.locationPath(projectId, locationId),
        keyRingId,
      })
    );
    const cryptoKeyId = `user_${Date.now()}_${walletAddress.slice(2, 10)}`;
    const algorithm =
      protos.google.cloud.kms.v1.CryptoKeyVersion.CryptoKeyVersionAlgorithm
        .EC_SIGN_P256_SHA256;
    const protectionLevel = protos.google.cloud.kms.v1.ProtectionLevel.SOFTWARE;
    const createReq: protos.google.cloud.kms.v1.ICreateCryptoKeyRequest = {
      parent: keyRingName,
      cryptoKeyId,
      cryptoKey: {
        purpose:
          protos.google.cloud.kms.v1.CryptoKey.CryptoKeyPurpose.ASYMMETRIC_SIGN,
        versionTemplate: {
          algorithm,
          protectionLevel,
        },
        labels: { wallet: walletAddress.toLowerCase() },
      },
    };
    const [createdKey] = await client.createCryptoKey(createReq);
    return createdKey.name;
  }

  // async login({ email, password }: LoginDto) {
  //   const user = await this.prisma.user.findUnique({
  //     where: { email },
  //     include: { role: true },
  //   });
  //   if (!user) {
  //     throw new ConflictException("Email hoặc mật khẩu không đúng");
  //   }

  //   const isPasswordValid = comparePassword(password, user.password);
  //   if (!isPasswordValid) {
  //     throw new ConflictException("Email hoặc mật khẩu không đúng");
  //   }

  //   const token = this.jwtService.sign({
  //     id: user.id,
  //     role: { name: user.role.name },
  //   });

  //   return {
  //     message: "Đăng nhập thành công",
  //     token,
  //   };
  // }
}
