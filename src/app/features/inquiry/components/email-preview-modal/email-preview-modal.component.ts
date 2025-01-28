import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmailData } from '@core/utils/email.util';
import { PrimeTemplate } from 'primeng/api';
import { Dialog } from 'primeng/dialog';
import { TabView, TabPanel } from 'primeng/tabview';
import { Button } from 'primeng/button';
import { Provider } from '@models/provider.model';

@Component({
  selector: 'app-email-preview-modal',
  standalone: true,
  imports: [CommonModule, Dialog, TabView, TabPanel, Button, PrimeTemplate],
  templateUrl: './email-preview-modal.component.html',
})
export class EmailPreviewModalComponent {
  @Input() visible = false;
  @Input() emailData!: Map<string, EmailData>;
  @Input() providers!: Map<string, Provider>;
  @Input() providerQuotations: any[] = [];
  @Input() isSending = false;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() send = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  getProviderName(key: string): string {
    return this.providers.get(key)?.name || 'Unknown Provider';
  }

  isProviderSent(providerId: string): boolean {
    const quotation = this.providerQuotations.find(
      (q) => q.provider === providerId
    );
    return quotation?.sent || false;
  }

  getStatusClass(key: string): string {
    return this.isProviderSent(key) ? 'text-green-600' : 'text-yellow-600';
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
