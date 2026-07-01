import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly from: string;
  private readonly frontendUrl: string;

  constructor(private readonly config: ConfigService) {
    const user = this.config.get<string>('MAIL_USER');
    const pass = this.config.get<string>('MAIL_PASS');

    this.from = `"UTN Villa María" <${user}>`;
    this.frontendUrl = this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:4200';

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const link = `${this.frontendUrl}/verify-email?token=${token}`;
    await this.send(
      to,
      'Verificá tu cuenta — UTN Villa María',
      `<p>Hola,</p>
       <p>Hacé click en el siguiente link para verificar tu cuenta:</p>
       <p><a href="${link}">${link}</a></p>
       <p>Si no te registraste, ignorá este mensaje.</p>`,
    );
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const link = `${this.frontendUrl}/reset-password?token=${token}`;
    await this.send(
      to,
      'Recuperar contraseña — UTN Villa María',
      `<p>Hola,</p>
       <p>Hacé click en el siguiente link para restablecer tu contraseña:</p>
       <p><a href="${link}">${link}</a></p>
       <p>Si no solicitaste esto, ignorá este mensaje.</p>`,
    );
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({ from: this.from, to, subject, html });
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error as Error);
      throw error;
    }
  }
}
