import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.html',
})
export class ToastComponent {
  toastService = inject(ToastService);

  iconFor(kind: string): string {
    if (kind === 'success') return 'bi-check-circle';
    if (kind === 'error') return 'bi-x-circle';
    return 'bi-info-circle';
  }

  classFor(kind: string): string {
    if (kind === 'success') return 'text-bg-success';
    if (kind === 'error') return 'text-bg-danger';
    return 'text-bg-info';
  }
}
