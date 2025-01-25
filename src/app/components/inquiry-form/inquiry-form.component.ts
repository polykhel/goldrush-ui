import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { DestroyService } from '@core/services/destroy.service';
import { ExchangeRateService } from '@core/services/exchange-rate.service';
import { InquiryService } from '@core/services/inquiry.service';
import { ProviderService } from '@core/services/provider.service';
import { Inquiry } from '@models/inquiry.model';
import { Provider } from '@models/provider.model';
import { User } from '@models/user.model';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { DatePicker } from 'primeng/datepicker';
import { DropdownModule } from 'primeng/dropdown';
import { FloatLabel } from 'primeng/floatlabel';
import { Fluid } from 'primeng/fluid';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { RadioButton } from 'primeng/radiobutton';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { Toast } from 'primeng/toast';
import { firstValueFrom, iif, lastValueFrom, takeUntil } from 'rxjs';

type ProviderQuotation = Partial<{
  includeInEmail: boolean;
  status: 'pending' | 'received' | 'not_available' | 'no_response';
  price: number | null;
  currency: string;
  exchangeRate: number | null;
  phpEquivalent: number | null;
  remarks: string;
  emailRemarks: string;
  provider: string;
}>;

@Component({
  selector: 'app-inquiry-form',
  imports: [
    ReactiveFormsModule,
    Checkbox,
    RadioButton,
    DatePicker,
    FloatLabel,
    InputText,
    InputNumber,
    NgForOf,
    Button,
    NgIf,
    Textarea,
    DropdownModule,
    Select,
    InputGroup,
    InputGroupAddon,
    Fluid,
    DatePipe,
    Toast,
  ],
  templateUrl: './inquiry-form.component.html',
  styleUrl: './inquiry-form.component.css',
  providers: [MessageService],
})
export class InquiryFormComponent implements OnInit {
  currencies = ['PHP', 'USD'];
  formBuilder = inject(FormBuilder);
  isEditMode = false;

  inquiryForm = this.formBuilder.group({
    clientName: ['', [Validators.required]],
    date: [new Date(), [Validators.required]],
    contactPoint: this.formBuilder.control<string | null>(null),
    contactPointOther: [''],
    travelDays: [null, [Validators.required]],
    travelNights: [null, [Validators.required]],
    destination: [null, [Validators.required]],
    dateRanges: this.formBuilder.array<{ start: Date, end: Date }[]>([]),
    preferredHotel: [null],
    paxAdult: [null, [Validators.required]],
    paxChild: [null, [Validators.required]],
    paxChildAges: [''],
    packageType: this.formBuilder.control<string>('allIn'),
    otherServices: [''],
    providerQuotations: this.formBuilder.array<ProviderQuotation>([]),
    remarks: [''],
    submitted: this.formBuilder.control<boolean>(false),
    createdBy: this.formBuilder.control<string | null>({
      value: null,
      disabled: true,
    }),
    createdAt: this.formBuilder.control<Date | null>({
      value: null,
      disabled: true,
    }),
    updatedBy: this.formBuilder.control<string | null>({
      value: null,
      disabled: true,
    }),
    updatedAt: this.formBuilder.control<Date | null>({
      value: null,
      disabled: true,
    }),
  });
  providers: Provider[] = [];
  quotationStatuses = [
    { label: 'Pending', value: 'pending', class: 'text-yellow-600' },
    { label: 'Received', value: 'received', class: 'text-green-600' },
    { label: 'Not Available', value: 'not_available', class: 'text-red-600' },
    { label: 'No Response', value: 'no_response', class: 'text-gray-600' },
  ];
  isLoadingRate: boolean[] = [];
  exchangeRateLastUpdated: (Date | null)[] = [];
  currentInquiry: Inquiry | null = null;
  private currentUser: User | null = null;

  constructor(
    private providerService: ProviderService,
    private exchangeRateService: ExchangeRateService,
    private authService: AuthService,
    private destroy$: DestroyService,
    private inquiryService: InquiryService,
    private messageService: MessageService,
    private route: ActivatedRoute,
  ) {
    this.addDateRange();
  }

  get dateRanges(): FormArray {
    return this.inquiryForm.get('dateRanges') as FormArray;
  }

  get providerQuotations(): FormArray {
    return this.inquiryForm.get('providerQuotations') as FormArray;
  }

  get createdAt(): FormControl {
    return this.inquiryForm.get('createdAt') as FormControl;
  }

  get createdBy(): FormControl {
    return this.inquiryForm.get('createdBy') as FormControl;
  }

  get updatedAt(): FormControl {
    return this.inquiryForm.get('updatedAt') as FormControl;
  }

  get updatedBy(): FormControl {
    return this.inquiryForm.get('updatedBy') as FormControl;
  }

  async initForm() {
    const params = await firstValueFrom(this.route.params);

    if (params['id']) {
      this.isEditMode = true;
      this.currentInquiry = await firstValueFrom(
        this.inquiryService.getInquiry(params['id']),
      );
      this.inquiryForm.patchValue({
        ...this.currentInquiry,
        date:  new Date(this.currentInquiry.date),
        dateRanges: this.currentInquiry.dateRanges.map((dateRange) => ({
          start: new Date(dateRange.start),
          end: new Date(dateRange.end),
        })),
        providerQuotations: this.currentInquiry.providerQuotations.map(
          (quotation: any) => ({
            ...quotation,
            exchangeRate: quotation.exchangeRate ?? null,
            phpEquivalent: quotation.phpEquivalent ?? null,
          }),
        ),
      } as any)
      console.log(this.currentInquiry);
      console.log(this.inquiryForm.value);
    }

    const providerListData = await firstValueFrom(
      this.providerService.getProviders(),
    );
    if (providerListData) {
      this.providers = providerListData.data;
      const map =
        this.currentInquiry?.providerQuotations.map((c) => c.provider) ?? [];

      this.providers
        .filter((p) => !map.includes(p.documentId))
        .forEach((provider) => {
          this.providerQuotations.push(
            this.formBuilder.group({
              includeInEmail: [false],
              providerStatus: ['pending'],
              price: [null],
              currency: ['PHP'],
              exchangeRate: [{ value: null, disabled: true }],
              phpEquivalent: [{ value: null, disabled: true }],
              remarks: [''],
              emailRemarks: [''],
              provider: [provider.documentId],
              sent: [false],
            }),
          );
        });
    }
  }

  ngOnInit(): void {
    this.initForm();
  }

  newDateRange(): FormGroup {
    return this.formBuilder.group({
      start: [null],
      end: [null],
    });
  }

  addDateRange() {
    this.dateRanges.push(this.newDateRange());
  }

  removeDateRange(index: number) {
    this.dateRanges.removeAt(index);
  }

  onPriceInput(index: number) {
    const quotationGroup = this.providerQuotations.at(index);
    const exchangeRateControl = quotationGroup.get('exchangeRate');
    const price = quotationGroup.get('price')?.value;

    if (price) {
      quotationGroup.get('status')?.setValue('received');
    }

    if (price && quotationGroup.get('currency')?.value !== 'PHP') {
      exchangeRateControl?.enable();
    } else {
      exchangeRateControl?.disable();
      exchangeRateControl?.setValue(null);
      quotationGroup.get('phpEquivalent')?.setValue(null);
    }
  }

  onCurrencyChange(index: number) {
    const control = this.providerQuotations.at(index);
    const currency = control.get('currency')?.value;
    const price = control.get('price')?.value;
    const exchangeRateControl = control.get('exchangeRate');

    if (currency === 'PHP') {
      exchangeRateControl?.disable();
      exchangeRateControl?.setValue(null);
      control.get('phpEquivalent')?.setValue(null);
    } else if (price) {
      exchangeRateControl?.enable();
    }
  }

  fetchExchangeRate(index: number) {
    const control = this.providerQuotations.at(index);
    const currency = control.get('currency')?.value;

    if (currency === 'PHP') return;

    this.isLoadingRate[index] = true;

    this.exchangeRateService.getExchangeRate(currency).subscribe({
      next: (rate) => {
        control.patchValue({ exchangeRate: rate });
        this.exchangeRateLastUpdated[index] = new Date();
        this.calculatePhpEquivalent(index);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch exchange rate',
        });
      },
      complete: () => {
        this.isLoadingRate[index] = false;
      },
    });
  }

  calculatePhpEquivalent(index: number) {
    const control = this.providerQuotations.at(index);
    const price = control.get('price')?.value;
    const rate = control.get('exchangeRate')?.value;

    if (price && rate) {
      const phpEquivalent = price * rate;
      control.get('phpEquivalent')?.setValue(phpEquivalent);
    } else {
      control.get('phpEquivalent')?.setValue(null);
    }
  }

  getStatusClass(status: string): string {
    return (
      this.quotationStatuses.find((s) => s.value === status)?.class ||
      'text-gray-600'
    );
  }

  saveInquiry() {
    if (this.inquiryForm.valid) {
      const formValue = this.inquiryForm.getRawValue();

      iif(
        () => this.isEditMode,
        this.inquiryService.updateInquiry(
          this.currentInquiry?.documentId!,
          this.mapFormToModel(formValue),
        ),
        this.inquiryService.saveInquiry(this.mapFormToModel(formValue)),
      ).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Inquiry saved successfully',
          });
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to save inquiry',
          });
          console.error('Error saving inquiry:', error);
        },
      });
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields',
      });
    }
  }

  sendQuotations() {
    if (this.inquiryForm.valid) {
      const emailData = this.inquiryService.prepareEmailData(
        this.mapFormToModel(this.inquiryForm.getRawValue()),
      );

      // For now, just log the email content for each provider
      Object.entries(emailData).forEach(([providerId, emailContent]) => {
        console.log(
          `Email content for provider ${this.providers[Number(providerId)].name}:`,
        );
        console.log(emailContent);
      });

      this.messageService.add({
        severity: 'info',
        summary: 'Email Preview',
        detail: 'Check console for email content',
      });
    }
  }

  mapFormToModel(formValue: any): Inquiry {
    return {
      ...formValue,
      providerQuotations: formValue.providerQuotations.map(
        (quotation: any) => ({
          ...quotation
        }),
      )
    };
  }
}
