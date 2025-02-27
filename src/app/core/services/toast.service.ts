import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private messageService = inject(MessageService);

  success(summary: string, detail?: string) {
    this.messageService.add({
      severity: 'success',
      summary,
      detail,
    });
  }

  defaultSuccess(detail: string) {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail,
    });
  }

  error(summary: string, detail?: string) {
    this.messageService.add({
      severity: 'error',
      summary,
      detail,
    });
  }

  defaultError(detail: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail,
    });
  }

  warn(summary: string, detail?: string) {
    this.messageService.add({
      severity: 'warn',
      summary,
      detail,
    });
  }

  info(summary: string, detail?: string) {
    this.messageService.add({
      severity: 'info',
      summary,
      detail,
    });
  }

  /**
   * Helper method to show a message with a delay using setTimeout.
   * @param severity - Severity of the message (e.g., 'info', 'warn').
   * @param summary - Summary of the message.
   * @param detail - Detailed description of the message.
   */
  showDelayedMessage(severity: string, summary: string, detail: string): void {
    setTimeout(() => {
      this.messageService.add({
        severity,
        summary,
        detail,
      });
    }, 0);
  }
}
