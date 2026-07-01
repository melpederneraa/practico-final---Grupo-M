import { Component, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-verify-pending',
  templateUrl: './verify-pending.html',
})
export class VerifyPendingPage {
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  loading = signal(false);

  async resend(): Promise<void> {
    this.loading.set(true);
    try {
      await firstValueFrom(this.auth.resendVerification());
      this.toast.success('Email reenviado');
    } catch (err: any) {
      this.toast.error(err.error?.message || 'No se pudo reenviar el email');
    } finally {
      this.loading.set(false);
    }
  }
}
