import { randomUUID } from 'crypto';
import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { UserEntity } from '../users/entities/user.entity';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async register(email: string, password: string) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) throw new ConflictException('El email ya esta registrado');

    const isFirstUser = (await this.usersService.findAll()).length === 0;
    const hashed = await bcrypt.hash(password, 10);
    const verificationToken = randomUUID();

    const user = await this.usersService.save({
      email,
      password: hashed,
      role: isFirstUser ? 'admin' : 'user',
      isVerified: false,
      verificationToken,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    } as UserEntity);

    await this.mailService.sendVerificationEmail(user.email, verificationToken);

    return { user: this.sanitize(user), access_token: this.signToken(user) };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) throw new UnauthorizedException('Credenciales inválidas');

    return { user: this.sanitize(user), access_token: this.signToken(user) };
  }

  async verifyEmail(token: string) {
    const user = await this.usersService.findByVerificationToken(token);
    if (!user) throw new BadRequestException('Token inválido o expirado');

    user.isVerified = true;
    user.verificationToken = null;
    await this.usersService.save(user);
    return { message: 'Email verificado' };
  }

  async resendVerification(user: UserEntity) {
    if (user.isVerified) {
      return { message: 'Email ya verificado' };
    }
    const verificationToken = randomUUID();
    user.verificationToken = verificationToken;
    await this.usersService.save(user);
    await this.mailService.sendVerificationEmail(user.email, verificationToken);
    return { message: 'Email reenviado' };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (user) {
      const resetPasswordToken = randomUUID();
      user.resetPasswordToken = resetPasswordToken;
      user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
      await this.usersService.save(user);
      await this.mailService.sendPasswordResetEmail(user.email, resetPasswordToken);
    }
    return { message: 'Si el email existe, recibirás un link' };
  }

  async resetPassword(token: string, password: string) {
    const user = await this.usersService.findByResetToken(token);
    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires.getTime() < Date.now()) {
      throw new BadRequestException('Token inválido o expirado');
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await this.usersService.save(user);
    return { message: 'Contraseña actualizada' };
  }

  private signToken(user: UserEntity) {
    return this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });
  }

  private sanitize(user: UserEntity) {
    const { password, verificationToken, resetPasswordToken, resetPasswordExpires, ...rest } = user;
    return rest;
  }
}
