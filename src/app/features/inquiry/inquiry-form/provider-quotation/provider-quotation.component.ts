import { DatePipe, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ProviderQuotation } from '@models/inquiry.model';
import { Provider } from '@models/provider.model';
import { ExchangeRateService } from '@services/exchange-rate.service';
import { CURRENCIES, PROVIDER_QUOTATION_STATUSES } from '@utils/constants.util';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { FloatLabel } from 'primeng/floatlabel';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';

@Component({
  selector: 'app-provider-quotation',
  templateUrl: './provider-quotation.component.html',
  imports: [
    Button,
    DatePipe,
    FloatLabel,
    InputGroup,
    InputGroupAddon,
    InputNumber,
    InputText,
    NgIf,
    ReactiveFormsModule,
    Select,
    Textarea,
  ],
  providers: [MessageService],
})
export class ProviderQuotationComponent implements OnInit {
  currencies = CURRENCIES;

  @Input({ required: true }) provider!: Provider;
  @Input({ required: true }) formGroup!: FormGroup;
  @Input() isEditMode = false;

  @Output() onGenerateQuotation = new EventEmitter<ProviderQuotation>();
  @Output() onRemove = new EventEmitter<void>();

  isLoadingRate = false;
  exchangeRateLastUpdated: Date | null = null;
  quotationStatuses = PROVIDER_QUOTATION_STATUSES;

  constructor(
    private exchangeRateService: ExchangeRateService,
    private messageService: MessageService,
  ) {}

  get showEmailSection(): boolean {
    const status = this.formGroup.get('status')?.value;
    return status === 'PENDING';
  }

  get showPricingSection(): boolean {
    const status = this.formGroup.get('status')?.value;
    return status === 'RECEIVED' || status === 'SENT';
  }

  ngOnInit() {
    this.exchangeRateLastUpdated = this.formGroup.get(
      'exchangeRateLastUpdated',
    )?.value;
  }

  onPriceInput() {
    const exchangeRate = this.formGroup.get('exchangeRate');
    const price = this.formGroup.get('priceAmount')?.value;

    if (price && this.formGroup.get('currencyCode')?.value !== 'PHP') {
      exchangeRate?.enable();
    } else {
      exchangeRate?.disable();
      exchangeRate?.setValue(null);
      this.formGroup.get('phpEquivalentAmount')?.setValue(null);
    }
  }

  onCurrencyChange() {
    const currency = this.formGroup.get('currencyCode')?.value;
    const price = this.formGroup.get('priceAmount')?.value;
    const exchangeRate = this.formGroup.get('exchangeRate');

    if (currency === 'PHP') {
      exchangeRate?.disable();
      exchangeRate?.setValue(null);
      this.formGroup.get('phpEquivalentAmount')?.setValue(null);
    } else if (price) {
      exchangeRate?.enable();
    }
  }

  fetchExchangeRate() {
    const currency = this.formGroup.get('currencyCode')?.value;

    if (currency === 'PHP') return;

    this.isLoadingRate = true;

    this.exchangeRateService.getExchangeRate(currency).subscribe({
      next: (rate) => {
        this.formGroup.patchValue({
          exchangeRate: rate,
          exchangeRateLastUpdated: new Date(),
        });
        this.exchangeRateLastUpdated = new Date();
        this.calculatePhpEquivalent();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch exchange rate',
        });
      },
      complete: () => {
        this.isLoadingRate = false;
      },
    });
  }

  calculatePhpEquivalent() {
    const price = this.formGroup.get('priceAmount')?.value;
    const rate = this.formGroup.get('exchangeRate')?.value;

    if (price && rate) {
      const phpEquivalentAmount = price * rate;
      this.formGroup.get('phpEquivalentAmount')?.setValue(phpEquivalentAmount);
    } else {
      this.formGroup.get('phpEquivalentAmount')?.setValue(null);
    }
  }

  generateQuotation() {
    this.onGenerateQuotation.emit(this.formGroup.getRawValue());
  }

  remove() {
    this.onRemove.emit();
  }
}
