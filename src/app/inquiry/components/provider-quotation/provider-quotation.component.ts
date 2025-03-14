import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Provider } from '@models/provider.model';
import { Option } from '@models/option';
import { ExchangeRateService } from '@services/exchange-rate.service';
import { OptionsService } from '@services/options.service';
import { ToastService } from '@services/toast.service';
import { CURRENCIES } from '@utils/constants.util';
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
import { takeUntil } from 'rxjs';
import { DestroyService } from '@services/destroy.service';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { BookingService } from '@services/booking.service';
import { Router } from '@angular/router';

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
    Checkbox,
    ConfirmDialog
  ],
  providers: [ConfirmationService]
})
export class ProviderQuotationComponent implements OnInit {
  currencies = CURRENCIES;

  @Input({ required: true }) provider!: Provider;
  @Input({ required: true }) formGroup!: FormGroup;
  @Input() isEditMode = false;
  @Input() showFlightDetails = false;
  @Input() showChildPrices = false;
  @Input() inquiryStatus = '';
  @Input() inquiryId: string | null = null;

  @Output() onSendEmail = new EventEmitter<ProviderQuotation>();
  @Output() onGenerateQuotation = new EventEmitter<string>();
  @Output() onRemove = new EventEmitter<void>();

  isLoadingRate = false;
  exchangeRateLastUpdated: Date | null = null;
  quotationStatuses: Option[] = [];
  breakdownItems = ['Flight', 'Land Arrangement', 'Hotel', 'Airport Transfer', 'Other'];

  constructor(
    private exchangeRateService: ExchangeRateService,
    private providerQuotationService: ProviderQuotationService,
    private optionsService: OptionsService,
    private toastService: ToastService,
    private fb: FormBuilder,
    private destroy$: DestroyService,
    private confirmationService: ConfirmationService,
    private bookingService: BookingService,
    private router: Router,
  ) {}

  private cleanTextInput(text: string): string {
    return text
    .replace(/[^\x20-\x7E\n]/g, ''); // Remove non-printable ASCII characters except newlines
  }

  get showEmailSection(): boolean {
    const status = this.formGroup.get('status')?.value;
    return status === 'PENDING';
  }

  get showQuotationSection(): boolean {
    const status = this.formGroup.get('status')?.value;
    return status === 'RECEIVED';
  }

  get showFlightSection(): boolean {
    const status = this.formGroup.get('status')?.value;
    return this.showFlightDetails && (status === 'RECEIVED');
  }

  get showAdditionalSection(): boolean {
    const status = this.formGroup.get('status')?.value;
    return status === 'RECEIVED';
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

    this.optionsService.getQuotationStatuses()
      .pipe(takeUntil(this.destroy$))
      .subscribe(statuses => {
        this.quotationStatuses = statuses;
      });

    // Add paste event listeners to textareas
    ['inclusions', 'exclusions', 'optionalTours'].forEach(field => {
      const control = this.formGroup.get(field);
      if (control) {
        control.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(value => {
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

  createBooking() {
    this.confirmationService.confirm({
      message: 'This will create a booking for this inquiry. Are you sure you want to proceed?',
      header: 'Create Booking',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (this.formGroup.valid && this.formGroup.get('priceAmount')?.value) {
          this.toastService.info(
            'Creating Booking',
            'Creating booking...'
          );

          this.bookingService.createBookingFromInquiry(this.inquiryId!, this.formGroup.get('id')?.value).subscribe({
            next: (booking) => {
              this.router.navigate(['/bookings', booking.id]);
            },
            error: (error) => {
              this.toastService.error(
                'Error Creating Booking',
                error.message || 'An error occurred while creating the booking'
              );
            }
          });
        } else {
          this.toastService.warn('Validation Error', 'Please fill in all required fields');
        }
      }
    });
  }
}
