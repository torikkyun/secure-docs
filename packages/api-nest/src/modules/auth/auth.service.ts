import { ConflictException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ethers } from "ethers";
import { PrismaService } from "src/database/prisma.service";
import { RegisterDto } from "./dto/register.dto";

@Injectable()
export class AuthService {
  private readonly jwtService: JwtService;
  private readonly prisma: PrismaService;
  constructor(jwtService: JwtService, prisma: PrismaService) {
    this.jwtService = jwtService;
    this.prisma = prisma;
  }

  async register({
    walletAddress: rawWallet,
    username,
    email,
    signature,
    message,
  }: RegisterDto) {
    // Validate wallet format and normalize
    let walletAddress: string;
    try {
      walletAddress = ethers.getAddress(rawWallet);
    } catch {
      throw new ConflictException("INVALID_WALLET_ADDRESS");
    }

    // Verify signature (MetaMask / Ethereum)
    if (!(message && signature)) {
      throw new ConflictException("INVALID_SIGNATURE");
    }
    let recovered: string;
    try {
      recovered = ethers.verifyMessage(message, signature);
    } catch {
      throw new ConflictException("INVALID_SIGNATURE");
    }
    if (recovered.toLowerCase() !== walletAddress.toLowerCase()) {
      throw new ConflictException("INVALID_SIGNATURE");
    }

    // Kiểm tra walletAddress đã tồn tại
    const walletExists = await this.prisma.user.findUnique({
      where: { walletAddress },
    });
    if (walletExists) {
      throw new ConflictException("WALLET_ALREADY_EXISTS");
    }

    // Kiểm tra email đã tồn tại
    const emailExists = await this.prisma.user.findUnique({ where: { email } });
    if (emailExists) {
      throw new ConflictException("EMAIL_TAKEN");
    }

    // Validate publicKey (PEM format)
    // const pemRegex =
    //   /-----BEGIN PUBLIC KEY-----([\s\S]+)-----END PUBLIC KEY-----/;
    // if (!pemRegex.test(publicKey)) {
    //   throw new ConflictException("INVALID_PUBLIC_KEY");
    // }

    // (Đã verify signature phía trên bằng ethers)

    const role = await this.prisma.role.findUnique({ where: { name: "user" } });
    if (!role) {
      throw new ConflictException("Vai trò mặc định không tồn tại");
    }

    // Tạo asymmetric key trên Google KMS (nếu cấu hình env có GCP_PROJECT_ID)
    // NOTE: dynamic import is used to avoid loading google-auth libraries at
    // startup (which causes errors when ADC/credentials are not configured
    // for local development). If you enable KMS in env, ensure
    // `GOOGLE_APPLICATION_CREDENTIALS` or other ADC is configured.
    let kmsKeyName: string | null = null;
    try {
      const projectId = process.env.GCP_PROJECT_ID;
      if (projectId) {
        const locationId = process.env.GCP_KMS_LOCATION || "global";
        const keyRingId = process.env.GCP_KMS_KEYRING || "secure_docs_keyring";
        // dynamically import the KMS client only when needed
        const { KeyManagementServiceClient } = await import(
          "@google-cloud/kms"
        );
        const client = new KeyManagementServiceClient();
        const keyRingName = client.keyRingPath(
          projectId,
          locationId,
          keyRingId
        );
        // ensure key ring exists
        try {
          await client.getKeyRing({ name: keyRingName });
        } catch {
          await client.createKeyRing({
            parent: client.locationPath(projectId, locationId),
            keyRingId,
          });
        }
        const cryptoKeyId = `user_${Date.now()}_${walletAddress.slice(2, 10)}`;
        // Use P-256 (EC_SIGN_P256_SHA256) by default so KMS can create a
        // software-protected key without requiring Cloud HSM. This avoids the
        // "Algorithm ... not supported for protection level: SOFTWARE" error
        // seen when attempting SECP256K1 without HSM.
        // If you need SECP256K1 for on-chain signing with the same key, you
        // must use HSM-backed keys and a location that supports Cloud HSM.
        const algorithm =
          process.env.GCP_KMS_ALGORITHM || "EC_SIGN_P256_SHA256";
        const protectionLevel =
          process.env.GCP_KMS_PROTECTION_LEVEL || "SOFTWARE";
        // Use any-casts for the request/response to avoid strict gax typing
        // mismatches across different google-gax versions.
        const createReq: any = {
          parent: keyRingName,
          cryptoKeyId,
          cryptoKey: {
            purpose: "ASYMMETRIC_SIGN",
            versionTemplate: {
              algorithm: algorithm as any,
              protectionLevel: protectionLevel as any,
            },
            labels: { wallet: walletAddress.toLowerCase() },
          },
        };
        const createRes: any = await (client as any).createCryptoKey(createReq);
        const createdKey = Array.isArray(createRes) ? createRes[0] : createRes;
        kmsKeyName = createdKey?.name ?? null;
      }
    } catch (err) {
      // Do not block registration if KMS fails — log if you have a logger.
      // Keep kmsKeyName null and continue.
      // eslint-disable-next-line no-console
      console.warn(
        "KMS key creation skipped or failed:",
        err instanceof Error ? err.message : String(err)
      );
      kmsKeyName = null;
    }

    // Tạo user mới
    const user = await this.prisma.user.create({
      data: {
        walletAddress,
        username,
        email,
        roleId: role.id,
      },
    });

    return {
      success: true,
      message: "Đăng ký thành công",
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        username: user.username,
        email: user.email,
        kmsKeyName,
      },
    };
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
