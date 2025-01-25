import { DatePipe, Location, NgForOf, NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EmailService } from '@app/core/services/email.service';
import { AuthService } from '@core/services/auth.service';
import { DestroyService } from '@core/services/destroy.service';
import { ExchangeRateService } from '@core/services/exchange-rate.service';
import { InquiryService } from '@core/services/inquiry.service';
import { ProviderService } from '@core/services/provider.service';
import { EmailData, prepareProviderEmail } from '@core/utils/email.util';
import {
  Inquiry,
  ProviderQuotation,
  ProviderQuotationRequest,
} from '@models/inquiry.model';
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
import { firstValueFrom, iif, takeUntil } from 'rxjs';
import { EmailPreviewModalComponent } from './email-preview-modal/email-preview-modal.component';

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
    EmailPreviewModalComponent,
  ],
  templateUrl: './inquiry-form.component.html',
  styleUrl: './inquiry-form.component.css',
  providers: [MessageService],
})
export class InquiryFormComponent implements OnInit {
  currencies = ['PHP', 'USD'];
  formBuilder = inject(FormBuilder);
  isEditMode = false;
  showEmailPreview = false;
  emailData = new Map<string, EmailData>();
  isSending = false;

  inquiryForm = this.formBuilder.group({
    clientName: ['', [Validators.required]],
    date: [new Date(), [Validators.required]],
    contactPoint: this.formBuilder.control<string | null>(null),
    contactPointOther: [''],
    travelDays: [null, [Validators.required]],
    travelNights: [null, [Validators.required]],
    destination: [null, [Validators.required]],
    dateRanges: this.formBuilder.array<{ start: Date; end: Date }[]>([]),
    preferredHotel: [null],
    paxAdult: [null, [Validators.required]],
    paxChild: [null, [Validators.required]],
    paxChildAges: [''],
    packageType: this.formBuilder.control<string>('allIn'),
    otherServices: [''],
    providerQuotations: this.formBuilder.array<ProviderQuotation>([]),
    remarks: [''],
    submitted: this.formBuilder.control<boolean>(false),
    creator: this.formBuilder.control<string | null>({
      value: null,
      disabled: true,
    }),
    createdAt: this.formBuilder.control<Date | null>({
      value: null,
      disabled: true,
    }),
    modifier: this.formBuilder.control<string | null>({
      value: null,
      disabled: true,
    }),
    updatedAt: this.formBuilder.control<Date | null>({
      value: null,
      disabled: true,
    }),
  });
  providers: Provider[] = [];
  providerMap = new Map<string, Provider>();
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
    private emailService: EmailService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
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

  get creator(): FormControl {
    return this.inquiryForm.get('creator') as FormControl;
  }

  get modifier(): FormControl {
    return this.inquiryForm.get('modifier') as FormControl;
  }

  get updatedAt(): FormControl {
    return this.inquiryForm.get('updatedAt') as FormControl;
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
        date: new Date(this.currentInquiry.date),
        dateRanges: this.currentInquiry.dateRanges.map((dateRange) => ({
          start: new Date(dateRange.start),
          end: new Date(dateRange.end),
        })),
      } as any);
    }

    const providerListData = await firstValueFrom(
      this.providerService.getProviders(),
    );
    if (providerListData) {
      this.providers = providerListData.data;

      this.providerMap = providerListData.data.reduce((acc, provider) => {
        acc.set(provider.documentId, provider);
        return acc;
      }, new Map<string, Provider>());

      const currentProvidersMap =
        this.currentInquiry?.providerQuotations.reduce(
          (acc, providerQuotation) => {
            acc.set(providerQuotation.provider.documentId, providerQuotation);
            return acc;
          },
          new Map<string, ProviderQuotation>(),
        );

      this.providers.forEach((provider) => {
        const existingProvider = currentProvidersMap?.get(provider.documentId);

        this.providerQuotations.push(
          this.formBuilder.group({
            includeInEmail: [existingProvider?.includeInEmail ?? false],
            providerStatus: [existingProvider?.providerStatus ?? 'pending'],
            price: [existingProvider?.price ?? null],
            currency: [existingProvider?.currency ?? 'PHP'],
            exchangeRate: [
              { value: existingProvider?.exchangeRate ?? null, disabled: true },
            ],
            phpEquivalent: [
              {
                value: existingProvider?.phpEquivalent ?? null,
                disabled: true,
              },
            ],
            remarks: [existingProvider?.remarks ?? ''],
            emailRemarks: [existingProvider?.emailRemarks ?? ''],
            provider: [provider.documentId],
            sent: [existingProvider?.sent ?? false],
          }),
        );
      });
    }
  }

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.currentUser = user;
      });

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

          if (!this.isEditMode) {
            this.router.navigate(['/inquiries']);
          }
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
      this.emailData = prepareProviderEmail(
        this.mapProviderQuotations(this.inquiryForm.getRawValue()),
      );

      if (this.emailData.size === 0) {
        this.messageService.add({
          severity: 'info',
          summary: 'No Quotations',
          detail: 'No new quotations to send. All selected quotations have already been sent.',
        });
        return;
      }

      this.showEmailPreview = true;
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields',
      });
    }
  }

  async handleSendEmails() {
    try {
      this.isSending = true;
      const emailPromises = Array.from(this.emailData.entries()).map(
        async ([providerId, emailData]) => {
          const provider = this.providerMap.get(providerId);
          if (!provider) {
            console.error(`Provider not found for ID: ${providerId}`);
            return;
          }

          return firstValueFrom(
            this.emailService.sendEmail({
              to: provider.email,
              subject: emailData.subject,
              html: emailData.emailContent,
            }),
          );
        },
      );

      await Promise.all(emailPromises.filter(Boolean));

      // Update sent status for providers
      const quotations = this.providerQuotations.controls;
      this.emailData.forEach((_, providerId) => {
        const index = quotations.findIndex(
          (q) => q.get('provider')?.value === providerId,
        );
        if (index !== -1) {
          quotations[index].patchValue({ sent: true });
        }
      });

      // Save the inquiry with updated sent status
      this.saveInquiry();

      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Emails sent successfully',
      });
      this.showEmailPreview = false;
    } catch (error) {
      console.error('Error sending emails:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to send emails',
      });
    } finally {
      this.isSending = false;
    }
  }

  mapFormToModel(formValue: any): Inquiry {
    return {
      ...formValue,
      providerQuotations: formValue.providerQuotations.map(
        (quotation: any) => ({
          ...quotation,
        }),
      ),
      creator: this.isEditMode
        ? this.currentInquiry?.creator
        : (this.currentUser?.username ?? null),
      modifier: this.currentUser?.username ?? null,
    };
  }

  mapProviderQuotations(inquiry: any): ProviderQuotationRequest[] {
    return inquiry.providerQuotations
      .filter((quotation: any) =>
        quotation.includeInEmail && !quotation.sent
      )
      .map((quotation: any) => ({
        providerId: quotation.provider,
        dateRanges: inquiry.dateRanges,
        travelDays: inquiry.travelDays,
        travelNights: inquiry.travelNights,
        destination: inquiry.destination,
        paxAdult: inquiry.paxAdult,
        paxChild: inquiry.paxChild,
        paxChildAges: inquiry.paxChildAges,
        packageType: inquiry.packageType,
        preferredHotel: inquiry.preferredHotel,
        otherServices: inquiry.otherServices,
        emailRemarks: quotation.emailRemarks,
        sender: `${this.currentUser?.firstName} ${this.currentUser?.lastName?.charAt(0)}.`,
        sent: quotation.sent,
      }));
  }

  goBack() {
    this.location.back();
  }
}
