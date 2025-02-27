import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EmailData } from '@utils/email.util';
import { PrimeTemplate } from 'primeng/api';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Divider } from 'primeng/divider';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-email-preview-modal',
  standalone: true,
  imports: [CommonModule, Dialog, TabsModule, Button, PrimeTemplate, Divider],
  templateUrl: './email-preview-modal.component.html',
})
export class EmailPreviewModalComponent {
  @Input() visible = false;
  @Input() emailData!: EmailData;
  @Input() isSending = false;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() send = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  isProviderSent(): boolean {
    return this.emailData.sent;
  }

  getStatusClass(): string {
    return this.isProviderSent() ? 'text-green-600' : 'text-yellow-600';
  }

  onSend() {
    this.send.emit();
  }

  onCancel() {
    this.cancel.emit();
    this.visible = false;
    this.visibleChange.emit(false);
  }
}
