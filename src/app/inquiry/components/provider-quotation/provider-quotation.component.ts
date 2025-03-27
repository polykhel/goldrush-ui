import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Option } from '@models/option';
import { ProviderQuotation } from '@models/provider-quotation.model';
import { Provider } from '@models/provider.model';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BookingService } from '@services/booking.service';
import { ExchangeRateService } from '@services/exchange-rate.service';
import { OptionsService } from '@services/options.service';
import { ProviderQuotationService } from '@services/provider-quotation.service';
import { ToastService } from '@services/toast.service';
import { CURRENCIES } from '@utils/constants.util';
import { ConfirmationService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { DatePicker } from 'primeng/datepicker';
import { FloatLabel } from 'primeng/floatlabel';
import { Fluid } from 'primeng/fluid';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputNumber, InputNumberInputEvent } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { RadioButton } from 'primeng/radiobutton';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';

@UntilDestroy()
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
    ConfirmDialog,
    RadioButton,
  ],
  providers: [ConfirmationService],
})
export class ProviderQuotationComponent implements OnInit {
  currencies = CURRENCIES;

  @Input({ required: true }) provider!: Provider;
  @Input({ required: true }) formGroup!: FormGroup;
  @Input() isEditMode = false;
  @Input() showFlightDetails = false;
  @Input() showChildPrices = false;
  @Input() showSeniorPrices = false;
  @Input() inquiryStatus = '';
  @Input() inquiryId: string | null = null;

  @Output() onSendEmail = new EventEmitter<ProviderQuotation>();
  @Output() onGenerateQuotation = new EventEmitter<string>();
  @Output() onRemove = new EventEmitter<void>();

  isLoadingRate = false;
  exchangeRateLastUpdated: Date | null = null;
  quotationStatuses: Option[] = [];
  breakdownItems = [
    'Flight',
    'Land Arrangement',
    'Hotel',
    'Airport Transfer',
    'Other',
  ];

  constructor(
    private exchangeRateService: ExchangeRateService,
    private providerQuotationService: ProviderQuotationService,
    private optionsService: OptionsService,
    private toastService: ToastService,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private bookingService: BookingService,
    private router: Router,
  ) {}

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
    return this.showFlightDetails && status === 'RECEIVED';
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

  get seniorPriceBreakdownArray(): FormArray {
    return this.formGroup.get('seniorPriceBreakdown') as FormArray;
  }

  ngOnInit() {
    this.exchangeRateLastUpdated = this.formGroup.get(
      'exchangeRateLastUpdated',
    )?.value;

    this.optionsService.getQuotationStatuses().subscribe((statuses) => {
      this.quotationStatuses = statuses;
    });

    // Add paste event listeners to textareas
    ['inclusions', 'exclusions', 'optionalTours', 'itinerary'].forEach(
      (field) => {
        const control = this.formGroup.get(field);
        if (control) {
          control.valueChanges.pipe(untilDestroyed(this)).subscribe((value) => {
            if (value) {
              const cleanedValue = this.cleanTextInput(value);
              if (cleanedValue !== value) {
                control.setValue(cleanedValue, { emitEvent: false });
              }
            }
          });
        }
      },
    );

    if (this.formGroup.get('showPriceBreakdown')?.value) {
      // Calculate initial breakdown total
      this.handleBreakdown('regular', 'update');
      this.handleBreakdown('child', 'update');
      this.handleBreakdown('senior', 'update');
    }
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
    this.formGroup.get('seniorPriceAmount')?.setValue(price);

    // Update breakdown items if price changes
    if (this.priceBreakdownArray.length === 1) {
      this.priceBreakdownArray.at(0).get('amount')?.setValue(price);
    }
  }

  onChildSeniorPriceInput(event: InputNumberInputEvent) {
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
    const seniorPrice = this.formGroup.get('seniorPriceAmount')?.value;
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

    if (seniorPrice && rate) {
      const phpEquivalentAmount = seniorPrice * rate;
      this.formGroup
        .get('seniorPhpEquivalentAmount')
        ?.setValue(phpEquivalentAmount);
    } else {
      this.formGroup.get('seniorPhpEquivalentAmount')?.setValue(null);
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

  handleBreakdown(
    breakdownType: 'regular' | 'child' | 'senior',
    action: 'add' | 'remove' | 'update',
    index?: number,
  ) {
    const breakdownMap = {
      regular: {
        array: this.priceBreakdownArray,
        amount: 'priceAmount',
        phpAmount: 'phpEquivalentAmount',
      },
      child: {
        array: this.childPriceBreakdownArray,
        amount: 'childPriceAmount',
        phpAmount: 'childPhpEquivalentAmount',
      },
      senior: {
        array: this.seniorPriceBreakdownArray,
        amount: 'seniorPriceAmount',
        phpAmount: 'seniorPhpEquivalentAmount',
      },
    };

    const breakdown = breakdownMap[breakdownType];

    switch (action) {
      case 'add':
        breakdown.array.push(
          this.fb.group({
            label: [this.breakdownItems[breakdown.array.length]],
            amount: [0],
          }),
        );
        break;

      case 'remove':
        if (typeof index === 'number') {
          breakdown.array.removeAt(index);
        }
        break;

      case 'update':
        const total = breakdown.array.controls.reduce(
          (sum, control) => sum + (control.get('amount')?.value || 0),
          0,
        );
        this.formGroup.patchValue({ [breakdown.amount]: total });
        if (this.formGroup.get('currencyCode')?.value !== 'PHP') {
          this.calculatePhpEquivalent();
        }
        break;
    }
  }

  removePriceBreakdownItem(
    index: number,
    breakdownType: 'regular' | 'child' | 'senior',
  ) {
    this.handleBreakdown(breakdownType, 'remove', index);
    this.handleBreakdown(breakdownType, 'update');
  }

  createBooking() {
    this.confirmationService.confirm({
      message:
        'This will create a booking for this inquiry. Are you sure you want to proceed?',
      header: 'Create Booking',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (this.formGroup.valid && this.formGroup.get('priceAmount')?.value) {
          this.toastService.info('Creating Booking', 'Creating booking...');

          this.bookingService
            .createBookingFromInquiry(
              this.inquiryId!,
              this.formGroup.get('id')?.value,
            )
            .subscribe({
              next: (booking) => {
                this.router.navigate(['/bookings', booking.id]);
              },
              error: (error) => {
                this.toastService.error(
                  'Error Creating Booking',
                  error.message ||
                    'An error occurred while creating the booking',
                );
              },
            });
        } else {
          this.toastService.warn(
            'Validation Error',
            'Please fill in all required fields',
          );
        }
      },
    });
  }

  private cleanTextInput(text: string): string {
    return text.replace(/[^\x20-\x7E\n]/g, ''); // Remove non-printable ASCII characters except newlines
  }
}
