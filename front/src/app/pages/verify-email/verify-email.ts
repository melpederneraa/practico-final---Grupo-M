import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-verify-email',
  imports: [RouterLink],
  templateUrl: './verify-email.html',
})
export class VerifyEmailPage implements OnInit {
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);

  loading = signal(true);
  success = signal(false);
  needsLogin = signal(false);

  async ngOnInit(): Promise<void> {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.loading.set(false);
      this.toast.error('Token inválido o expirado');
      return;
    }

    try {
      await firstValueFrom(this.auth.verifyEmail(token));
      this.success.set(true);
      this.toast.success('Email verificado correctamente');
    } catch (err: any) {
      this.toast.error(err.error?.message || 'Token inválido o expirado');
      this.needsLogin.set(!this.auth.isAuthenticated());
    } finally {
      this.loading.set(false);
    }
  }
}
