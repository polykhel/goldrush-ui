import { DatePipe, NgIf } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  CURRENCIES,
  PROVIDER_QUOTATION_STATUSES,
} from '@core/utils/constants.util';
import { ProviderQuotation } from '@models/inquiry.model';
import { Provider } from '@models/provider.model';
import { ExchangeRateService } from '@services/exchange-rate.service';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
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
    Checkbox,
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
  @Input({ required: true }) formArray!: FormArray;
  @Input() isEditMode = false;
  @Input() existingProviderQuotation: ProviderQuotation | null = null;

  isLoadingRate = false;
  exchangeRateLastUpdated: Date | null = null;
  quotationStatuses = PROVIDER_QUOTATION_STATUSES;

  group: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private exchangeRateService: ExchangeRateService,
    private messageService: MessageService,
  ) {
    this.group = this.formBuilder.group({
      includeInEmail: [false],
      providerStatus: ['pending'],
      price: [null],
      currency: ['PHP'],
      exchangeRate: [{ value: null, disabled: true }],
      exchangeRateLastUpdated: [{ value: null, disabled: true }],
      phpEquivalent: [{ value: null, disabled: true }],
      remarks: [''],
      emailRemarks: [''],
      provider: [''],
      sent: [false]
    });
}

  ngOnInit() {
    if (this.existingProviderQuotation) {
      this.group.patchValue(this.existingProviderQuotation);
    }
    this.formArray.push(this.group);
  }

  onPriceInput() {
    const exchangeRate = this.group.get('exchangeRate');
    const price = this.group.get('price')?.value;

    if (price) {
      this.group.get('providerStatus')?.setValue('received');
    }

    if (price && this.group.get('currency')?.value !== 'PHP') {
      exchangeRate?.enable();
    } else {
      exchangeRate?.disable();
      exchangeRate?.setValue(null);
      this.group.get('phpEquivalent')?.setValue(null);
    }
  }

  onCurrencyChange() {
    const currency = this.group.get('currency')?.value;
    const price = this.group.get('price')?.value;
    const exchangeRate = this.group.get('exchangeRate');

    if (currency === 'PHP') {
      exchangeRate?.disable();
      exchangeRate?.setValue(null);
      this.group.get('phpEquivalent')?.setValue(null);
    } else if (price) {
      exchangeRate?.enable();
    }
  }

  fetchExchangeRate() {
    const currency = this.group.get('currency')?.value;

    if (currency === 'PHP') return;

    this.isLoadingRate = true;

    this.exchangeRateService.getExchangeRate(currency).subscribe({
      next: (rate) => {
        this.group.patchValue({ exchangeRate: rate });
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
    const price = this.group.get('price')?.value;
    const rate = this.group.get('exchangeRate')?.value;

    if (price && rate) {
      const phpEquivalent = price * rate;
      this.group.get('phpEquivalent')?.setValue(phpEquivalent);
    } else {
      this.group.get('phpEquivalent')?.setValue(null);
    }
  }

  generateQuotation() {
    const providerQuotation = this.group.getRawValue();

    // Prepare the quotation data
    /*const quotationData = {
      title: providerQuotation.package
        ? undefined
        : `${inquiryData.travelDays}D${inquiryData.travelNights}N ${inquiryData.destination} Package`,
      travelDates: inquiryData.dateRanges,
      ratePerPax:
        providerQuotation.currency === 'PHP'
          ? providerQuotation.price
          : providerQuotation.phpEquivalent,
      noOfPax: (inquiryData.paxAdult || 0) + (inquiryData.paxChild || 0),
      packageId: providerQuotation.package,
      country: this.inquiryForm.get('destination')?.value,
      providerId: this.provider.documentId,
    };*/

    // Navigate to quotation generator with data
    /*this.router.navigate(['/quotation'], {
      queryParams: {
        data: btoa(JSON.stringify(quotationData))
      }
    });*/
  }
}
