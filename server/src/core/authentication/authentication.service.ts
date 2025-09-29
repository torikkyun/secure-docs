import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthenticationService {
  constructor() {}

  // async generateAccessToken(user: User): Promise<string> {
  //   const payload = { id: user.id };
  //   return this.jwtService.signAsync(payload);
  // }
}
