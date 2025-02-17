import { DatePipe, Location, NgForOf, NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup, FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuditFields } from '@models/base.model';
import { Country } from '@models/country.model';
import {
  Inquiry,
  InquiryStatus,
  ProviderQuotation,
  ProviderQuotationRequest,
} from '@models/inquiry.model';
import { Provider } from '@models/provider.model';
import { CountryService } from '@services/country.service';
import { DestroyService } from '@services/destroy.service';
import { EmailService } from '@services/email.service';
import { InquiryService } from '@services/inquiry.service';
import { ProviderService } from '@services/provider.service';
import { EmailData, prepareProviderEmail } from '@utils/email.util';
import { PACKAGE_OPTIONS } from '@utils/package.util';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { DatePicker } from 'primeng/datepicker';
import { DropdownModule } from 'primeng/dropdown';
import { FloatLabel } from 'primeng/floatlabel';
import { Fluid } from 'primeng/fluid';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { RadioButton } from 'primeng/radiobutton';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { Toast } from 'primeng/toast';
import { finalize, firstValueFrom, takeUntil } from 'rxjs';
import { EmailPreviewModalComponent } from './email-preview-modal/email-preview-modal.component';
import { ProviderQuotationComponent } from './provider-quotation/provider-quotation.component';

@Component({
  selector: 'app-inquiry-form',
  imports: [
    ReactiveFormsModule,
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
    Fluid,
    DatePipe,
    Toast,
    EmailPreviewModalComponent,
    ProviderQuotationComponent,
    Checkbox,
    FormsModule,
  ],
  templateUrl: './inquiry-form.component.html',
  providers: [MessageService],
})
export class InquiryFormComponent implements OnInit {
  fb = inject(FormBuilder);
  editMode = false;
  showEmailPreview = false;
  emailData = new Map<string, EmailData>();
  isSending = false;
  packageOptions = PACKAGE_OPTIONS;
  auditFields: AuditFields = {};

  inquiryForm = this.buildForm();
  countries: Country[] = [];
  providers: Provider[] = [];
  availableProviders: Provider[] = [];
  providerMap = new Map<string, Provider>();
  statusOptions: InquiryStatus[] = [];
  currentInquiry: Inquiry | null = null;
  inquiryId: string | null = null;
  saving = false;
  selectedProvider: string | null = null;

  constructor(
    private providerService: ProviderService,
    private countryService: CountryService,
    private destroy$: DestroyService,
    private inquiryService: InquiryService,
    private emailService: EmailService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
  ) {}

  get quotations(): FormArray {
    return this.inquiryForm.get('quotations') as FormArray;
  }

  getProviderQuotationControl(index: number): FormGroup {
    return this.quotations.at(index) as FormGroup;
  }

  get childrenControl(): FormControl {
    return this.inquiryForm.get('travelDetails.children') as FormControl;
  }

  buildForm() {
    return this.fb.group({
      id: new FormControl<string | null>(null),
      status: this.fb.nonNullable.control<string>('NEW', [Validators.required]),
      date: this.fb.nonNullable.control<Date>(new Date(), [
        Validators.required,
      ]),
      clientName: this.fb.nonNullable.control<string>('', [
        Validators.required,
      ]),
      source: this.fb.nonNullable.control<string>('', [Validators.required]),
      travelDetails: this.fb.group({
        countryId: this.fb.nonNullable.control<string>(null!, [
          Validators.required,
        ]),
        destination: this.fb.nonNullable.control<string>('', [
          Validators.required,
        ]),
        days: this.fb.nonNullable.control<number>(null!, [Validators.required]),
        nights: this.fb.nonNullable.control<number>(null!, [
          Validators.required,
        ]),
        startDate: this.fb.nonNullable.control<Date>(null!, [
          Validators.required,
        ]),
        endDate: this.fb.nonNullable.control<Date>(null!, [
          Validators.required,
        ]),
        preferredHotel: [''],
        adults: this.fb.nonNullable.control<number>(null!, [
          Validators.required,
        ]),
        children: this.fb.nonNullable.control<number>(null!, [
          Validators.required,
        ]),
        childAges: new FormControl<string | null>(null),
      }),
      packageType: this.fb.nonNullable.control<string>('ALL_INCLUSIVE', [
        Validators.required,
      ]),
      customPackageOptions: [[] as string[]],
      quotations: this.fb.nonNullable.array<ProviderQuotation>([]),
      remarks: new FormControl<string | null>(null),
    });
  }

  async ngOnInit() {
    await this.loadInitialData();
    await this.initForm();
  }

  async initForm() {
    const params = await firstValueFrom(this.route.params);

    const id = params['id'] || this.inquiryId;
    if (id) {
      this.editMode = true;
      this.currentInquiry = await firstValueFrom(
        this.inquiryService.getInquiry(id),
      );
      this.auditFields = {
        createdBy: this.currentInquiry.createdBy,
        createdAt: this.currentInquiry.createdAt,
        updatedBy: this.currentInquiry.updatedBy,
        updatedAt: this.currentInquiry.updatedAt,
      };

      if (this.currentInquiry?.quotations) {
        this.currentInquiry?.quotations.forEach((quotation) => {
          const group = this.buildProviderQuotationForm(quotation);
          this.quotations.push(group);
          this.updateAvailableProviders();
        })
      }

      this.inquiryForm.patchValue({
        ...this.currentInquiry,
        date: new Date(this.currentInquiry.date),
        travelDetails: {
          ...this.currentInquiry.travelDetails,
          startDate: new Date(this.currentInquiry.travelDetails.startDate),
          endDate: new Date(this.currentInquiry.travelDetails.endDate),
        },
        customPackageOptions:
          this.currentInquiry.customPackageOptions?.split(';') || [],
      });
    }
  }

  saveInquiry() {
    if (this.inquiryForm.valid) {
      const formValue = this.inquiryForm.getRawValue();
      const toSave = {
        ...formValue,
        customPackageOptions: formValue.customPackageOptions?.join(';') ?? null,
      };

      this.saving = true;
      this.messageService.add({
        severity: 'info',
        summary: 'Saving',
        detail: `${this.editMode ? 'Updating' : 'Creating'} inquiry...`,
      });

      this.inquiryService
        .saveInquiry(toSave)
        .pipe(
          finalize(() => (this.saving = false)),
          takeUntil(this.destroy$),
        )
        .subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Inquiry saved successfully',
            });

            if (!this.editMode) {
              this.editMode = true;
              this.inquiryId = response.id!;
              this.initForm();
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
    this.saveInquiry();

    if (this.inquiryForm.valid) {
      this.emailData = prepareProviderEmail(
        this.mapFormToEmailContent(this.inquiryForm.getRawValue()),
      );

      if (this.emailData.size === 0) {
        this.messageService.add({
          severity: 'info',
          summary: 'No Quotations',
          detail:
            'No new quotations to send. All selected quotations have already been sent.',
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

  mapFormToEmailContent(inquiry: any): ProviderQuotationRequest[] {
    return inquiry.providerQuotations
      .filter((quotation: any) => !quotation.sent)
      .map((quotation: any) => ({
        providerId: quotation.provider.id,
        dateRanges: inquiry.dateRanges,
        travelDays: inquiry.travelDays,
        travelNights: inquiry.travelNights,
        destination: inquiry.destination,
        paxAdult: inquiry.paxAdult,
        paxChild: inquiry.paxChild,
        paxChildAges: inquiry.paxChildAges,
        packageType: inquiry.packageType,
        customPackageOptions: inquiry.customPackageOptions.join(';'),
        preferredHotel: inquiry.preferredHotel,
        otherServices: inquiry.otherServices,
        emailRemarks: quotation.emailRemarks,
        sent: quotation.sent,
      }));
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
      const quotations = this.quotations.controls;
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
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to send emails',
      });
    } finally {
      this.isSending = false;
    }
  }

  generateQuotation(providerQuotation: ProviderQuotation) {
    if (!this.inquiryId) {
      this.messageService.add({
        severity: 'warning',
        summary: 'Inquiry not saved yet',
        detail: 'Please save inquiry first before generating',
      });
    }

    const inquiryData = this.inquiryForm.getRawValue();

    // Prepare the quotation data
    const quotationData = {
      clientName: inquiryData.clientName,
      destination: inquiryData.travelDetails.destination,
      title: `${inquiryData?.travelDetails.days}D${inquiryData?.travelDetails.nights}N ${inquiryData?.travelDetails.destination} Package`,
      travelDates: inquiryData?.travelDetails.startDate,
      ratePerPax:
        providerQuotation.currencyCode === 'PHP'
          ? providerQuotation.priceAmount
          : providerQuotation.phpEquivalentAmount,
      noOfPax:
        (inquiryData?.travelDetails.adults ?? 0) +
        (inquiryData?.travelDetails.children ?? 0),
      country: inquiryData?.travelDetails.countryId,
      provider: providerQuotation.providerId,
      packageType: inquiryData?.packageType,
      customPackageOptions: inquiryData?.customPackageOptions,
      inquiryId: this.inquiryId,
    };

    this.router.navigate(['/quotations/new'], {
      queryParams: {
        data: btoa(JSON.stringify(quotationData)),
      },
    });
  }

  goBack() {
    this.location.back();
  }

  buildProviderQuotationForm(quotation?: ProviderQuotation) {
    return this.fb.group({
      id: [quotation?.id ?? null],
      providerId: [quotation?.providerId ?? null],
      priceAmount: [quotation?.priceAmount ?? null],
      currencyCode: [quotation?.currencyCode ?? 'PHP'],
      exchangeRate: [{ value: quotation?.exchangeRate ?? null, disabled: true }],
      exchangeRateLastUpdated: [{ value: quotation?.exchangeRateLastUpdated ?? null, disabled: true }],
      phpEquivalentAmount: [{ value: quotation?.phpEquivalentAmount ?? null, disabled: true }],
      internalRemarks: [quotation?.internalRemarks ?? null],
      emailQuotation: [quotation?.emailQuotation ?? null],
      sent: [quotation?.sent ?? false],
      status: [quotation?.status ?? 'PENDING'],
    })
  }

  addQuotation() {
    if (
      this.selectedProvider &&
      !this.quotations.controls.some(
        (control) => control.get('providerId')?.value === this.selectedProvider,
      )
    ) {
      const provider = this.providerMap.get(this.selectedProvider);
      if (provider) {
        const group = this.buildProviderQuotationForm()
        group.controls.providerId.setValue(this.selectedProvider);

        this.quotations.push(group);
        this.selectedProvider = null;
        this.updateAvailableProviders();
      }
    }
  }

  removeQuotation(index: number) {
    const provider = this.quotations.at(index).get('providerId')?.value;
    this.quotations.removeAt(index);
    this.updateAvailableProviders();
  }

  private updateAvailableProviders() {
    const usedProviders = new Set(
      this.quotations.controls.map((control) => control.get('providerId')?.value),
    );
    this.availableProviders = this.providers.filter(
      (provider) => !usedProviders.has(provider.id),
    );
  }

  private async loadInitialData() {
    this.statusOptions = await firstValueFrom(
      this.inquiryService.getInquiryStatuses(),
    );

    this.countries = await firstValueFrom(this.countryService.getCountries());

    const providerListData = await firstValueFrom(
      this.providerService.getProviders(),
    );
    if (providerListData) {
      this.providers = providerListData;
      this.availableProviders = [...providerListData];
      this.providerMap = providerListData.reduce((acc, provider) => {
        acc.set(provider.id!, provider);
        return acc;
      }, new Map<string, Provider>());
    }
  }
}
