import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { EmailData } from '@utils/email.util';
import { Provider } from '@models/provider.model';
import { PrimeTemplate } from 'primeng/api';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-email-preview-modal',
  standalone: true,
  imports: [CommonModule, Dialog, TabsModule, Button, PrimeTemplate],
  templateUrl: './email-preview-modal.component.html',
})
export class EmailPreviewModalComponent implements OnChanges {
  @Input() visible = false;
  @Input() emailData!: Map<string, EmailData>;
  @Input() providers!: Map<string, Provider>;
  @Input() providerQuotations: any[] = [];
  @Input() isSending = false;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() send = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  selectedTab: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['emailData']?.currentValue) {
      const firstKey = this.emailData?.keys().next().value;
      if (firstKey) {
        this.selectedTab = firstKey;
      }
    }
  }

  getProviderName(key: string): string {
    return this.providers.get(key)?.name ?? 'Unknown Provider';
  }

  isProviderSent(providerId: string): boolean {
    const quotation = this.providerQuotations.find(
      (q) => q.provider === providerId,
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

  trackByKey(_: number, item: { key: string; value: any }): string {
    return item.key;
  }
}
