import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-reset-password',
  imports: [FormsModule, RouterLink],
  templateUrl: './reset-password.html',
})
export class ResetPasswordPage implements OnInit {
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);

  token = '';
  password = '';
  confirmPassword = '';
  loading = signal(false);
  success = signal(false);

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
  }

  async submit(): Promise<void> {
    if (this.password !== this.confirmPassword) {
      this.toast.error('Las contraseñas no coinciden');
      return;
    }

    this.loading.set(true);
    try {
      const res = await firstValueFrom(this.auth.resetPassword(this.token, this.password));
      this.toast.success(res.message);
      this.success.set(true);
    } catch (err: any) {
      this.toast.error(err.error?.message || 'Token inválido o expirado');
    } finally {
      this.loading.set(false);
    }
  }
}
