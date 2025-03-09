import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Provider } from '@models/provider.model';
import { ExchangeRateService } from '@services/exchange-rate.service';
import { ToastService } from '@services/toast.service';
import { CURRENCIES, PROVIDER_QUOTATION_STATUSES } from '@utils/constants.util';
import { Button } from 'primeng/button';
import { FloatLabel } from 'primeng/floatlabel';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputNumber, InputNumberInputEvent } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { ProviderQuotation } from '@models/provider-quotation.model';
import { ProviderQuotationService } from '@services/provider-quotation.service';
import { DatePicker } from 'primeng/datepicker';
import { Fluid } from 'primeng/fluid';
import { Checkbox } from 'primeng/checkbox';

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
    ReactiveFormsModule,
    Select,
    Textarea,
    DatePicker,
    Fluid,
    Checkbox
  ]
})
export class ProviderQuotationComponent implements OnInit {
  currencies = CURRENCIES;

  @Input({ required: true }) provider!: Provider;
  @Input({ required: true }) formGroup!: FormGroup;
  @Input() isEditMode = false;
  @Input() showFlightDetails = false;
  @Input() showChildPrices = false;

  @Output() onSendEmail = new EventEmitter<ProviderQuotation>();
  @Output() onGenerateQuotation = new EventEmitter<string>();
  @Output() onRemove = new EventEmitter<void>();

  isLoadingRate = false;
  exchangeRateLastUpdated: Date | null = null;
  quotationStatuses = PROVIDER_QUOTATION_STATUSES;
  breakdownItems = ['Flight', 'Land Arrangement', 'Hotel', 'Airport Transfer', 'Other'];

  constructor(
    private exchangeRateService: ExchangeRateService,
    private providerQuotationService: ProviderQuotationService,
    private toastService: ToastService,
    private fb: FormBuilder,
  ) {}

  private cleanTextInput(text: string): string {
    return text
    .replace(/[^\x20-\x7E\n]/g, '') // Remove non-printable ASCII characters except newlines
    .trim(); // Remove leading/trailing whitespace
  }

  get showEmailSection(): boolean {
    const status = this.formGroup.get('status')?.value;
    return status === 'INFORMATION_REQUESTED';
  }

  get showQuotationSection(): boolean {
    const status = this.formGroup.get('status')?.value;
    return status === 'PENDING' || status === 'INFORMATION_REQUESTED' || status === 'ACKNOWLEDGED';
  }

  get showFlightSection(): boolean {
    const status = this.formGroup.get('status')?.value;
    return this.showFlightDetails && (status === 'INFORMATION_REQUESTED' || status === 'ACKNOWLEDGED');
  }

  get showAdditionalSection(): boolean {
    const status = this.formGroup.get('status')?.value;
    return status === 'INFORMATION_REQUESTED' || status === 'ACKNOWLEDGED';
  }

  get isSent(): boolean {
    return this.formGroup.get('sent')?.value ?? false;
  }

  get priceBreakdownArray(): FormArray {
    return this.formGroup.get('priceBreakdown') as FormArray;
  }

  get childPriceBreakdownArray(): FormArray {
    return this.formGroup.get('childPriceBreakdown') as FormArray;
  }

  ngOnInit() {
    this.exchangeRateLastUpdated = this.formGroup.get(
      'exchangeRateLastUpdated',
    )?.value;

    // Add paste event listeners to textareas
    ['inclusions', 'exclusions', 'optionalTours'].forEach(field => {
      const control = this.formGroup.get(field);
      if (control) {
        control.valueChanges.subscribe(value => {
          if (value) {
            const cleanedValue = this.cleanTextInput(value);
            if (cleanedValue !== value) {
              control.setValue(cleanedValue, {emitEvent: false});
            }
          }
        });
      }
    });

    // Calculate initial breakdown total
    this.updatePriceBreakdown();
    this.updateChildPriceBreakdown();
  }

  onPriceInput(event: InputNumberInputEvent) {
    const price = event.value;
    const exchangeRate = this.formGroup.get('exchangeRate');

    if (price && this.formGroup.get('currencyCode')?.value !== 'PHP') {
      exchangeRate?.enable({ emitEvent: false });
      this.calculatePhpEquivalent();
    } else {
      exchangeRate?.disable({ emitEvent: false });
      exchangeRate?.setValue(null);
      this.formGroup.get('phpEquivalentAmount')?.setValue(null);
    }

    this.formGroup.get('childPriceAmount')?.setValue(price);

    // Update breakdown items if price changes
    if (this.priceBreakdownArray.length === 1) {
      this.priceBreakdownArray.at(0).get('amount')?.setValue(price);
    }
  }

  onChildPriceInput(event: InputNumberInputEvent) {
    const price = event.value;

    if (price && this.formGroup.get('currencyCode')?.value !== 'PHP') {
      this.calculatePhpEquivalent();
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

        const value = this.formGroup.getRawValue();
        this.providerQuotationService
          .updateProviderQuotation(value.id, {
            exchangeRate: rate,
            exchangeRateLastUpdated: this.exchangeRateLastUpdated,
            phpEquivalentAmount: value.phpEquivalentAmount,
            childPhpEquivalentAmount: value.childPhpEquivalentAmount,
          })
          .subscribe();
      },
      error: () => {
        this.toastService.defaultError('Failed to fetch exchange rate');
      },
      complete: () => {
        this.isLoadingRate = false;
      },
    });
  }

  calculatePhpEquivalent() {
    const price = this.formGroup.get('priceAmount')?.value;
    const childPrice = this.formGroup.get('childPriceAmount')?.value;
    const rate = this.formGroup.get('exchangeRate')?.value;

    if (price && rate) {
      const phpEquivalentAmount = price * rate;
      this.formGroup.get('phpEquivalentAmount')?.setValue(phpEquivalentAmount);
    } else {
      this.formGroup.get('phpEquivalentAmount')?.setValue(null);
    }

    if (childPrice && rate) {
      const phpEquivalentAmount = childPrice * rate;
      this.formGroup
        .get('childPhpEquivalentAmount')
        ?.setValue(phpEquivalentAmount);
    } else {
      this.formGroup.get('childPhpEquivalentAmount')?.setValue(null);
    }
  }

  sendQuotation() {
    this.onSendEmail.emit(this.formGroup.getRawValue());
  }

  generateQuotation() {
    const value = this.formGroup.getRawValue();

    this.providerQuotationService.saveProviderQuotation(value).subscribe({
      next: () => {
        this.toastService.success('Success', 'Quotation details saved.');
        this.onGenerateQuotation.emit(value.id);
      },
      error: () => {
        this.toastService.defaultError('Failed to generate quotation');
      },
    });
  }

  remove() {
    this.onRemove.emit();
  }

  // Price breakdown methods
  addPriceBreakdownItem() {
    this.priceBreakdownArray.push(
      this.fb.group({
        label: [this.breakdownItems[this.priceBreakdownArray.length]],
        amount: [0]
      })
    );
  }

  removePriceBreakdownItem(index: number) {
    this.priceBreakdownArray.removeAt(index);
    this.updatePriceBreakdown();
  }

  updatePriceBreakdown() {
    if (this.priceBreakdownArray.length > 0) {
      const breakdownTotal = this.priceBreakdownArray.controls.reduce(
        (sum, control) => sum + (control.get('amount')?.value || 0),
        0
      );
      this.formGroup.get('priceAmount')?.setValue(breakdownTotal);
    }
  }

  // Child price breakdown methods
  addChildPriceBreakdownItem() {
    this.childPriceBreakdownArray.push(
      this.fb.group({
        label: [this.breakdownItems[this.childPriceBreakdownArray.length]],
        amount: [0]
      })
    );
  }

  removeChildPriceBreakdownItem(index: number) {
    this.childPriceBreakdownArray.removeAt(index);
    this.updateChildPriceBreakdown();
  }

  updateChildPriceBreakdown() {
    if (this.childPriceBreakdownArray.length > 0) {
      const breakdownTotal = this.childPriceBreakdownArray.controls.reduce(
        (sum, control) => sum + (control.get('amount')?.value || 0),
        0
      );
      this.formGroup.get('childPriceAmount')?.setValue(breakdownTotal);
    }
  }
}
