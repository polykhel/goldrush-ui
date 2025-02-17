import { DatePipe, Location, NgForOf, NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EmailData, prepareProviderEmail } from '@utils/email.util';
import { Country } from '@models/country.model';
import {
  Inquiry, InquiryStatus,
  ProviderQuotation,
  ProviderQuotationRequest
} from '@models/inquiry.model';
import { Provider } from '@models/provider.model';
import { User } from '@models/user.model';
import { AuthService } from '@services/auth.service';
import { CountryService } from '@services/country.service';
import { DestroyService } from '@services/destroy.service';
import { EmailService } from '@services/email.service';
import { InquiryService } from '@services/inquiry.service';
import { ProviderService } from '@services/provider.service';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
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
import { Checkbox } from 'primeng/checkbox';
import { PACKAGE_OPTIONS } from '@utils/package.util';
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
  ],
  templateUrl: './inquiry-form.component.html',
  providers: [MessageService],
})
export class InquiryFormComponent implements OnInit {
  formBuilder = inject(FormBuilder);
  editMode = false;
  showEmailPreview = false;
  emailData = new Map<string, EmailData>();
  isSending = false;
  packageOptions = PACKAGE_OPTIONS;

  inquiryForm = this.formBuilder.group({
    status: ['NEW', [Validators.required]],
    date: [new Date(), [Validators.required]],
    clientName: ['', [Validators.required]],
    country: [null, [Validators.required]],
    source: this.formBuilder.group({
      type: [null],
      other: [''],
    }),
    travelDetails: this.formBuilder.group({
      countryId: [''],
      destination: ['', [Validators.required]],
      days: [null, [Validators.required]],
      nights: [null, [Validators.required]],
      startDate: [null],
      endDate: [null],
      preferredHotel: [''],
      adults: [null, [Validators.required]],
      children: [null, [Validators.required]]
    }),
    packageType: ['all-inclusive'],
    customPackageOptions: [null],
    providerQuotations: this.formBuilder.array<ProviderQuotation>([]),
    remarks: [null],
    creator: this.formBuilder.control<string | null>({
      value: null,
      disabled: true,
    }),
    modifier: this.formBuilder.control<string | null>({
      value: null,
      disabled: true,
    }),
  });
  countries: Country[] = [];
  providers: Provider[] = [];
  providerMap = new Map<string, Provider>();
  statusOptions: InquiryStatus[] = [];
  currentInquiry: Inquiry | null = null;
  inquiryId?: string | null = null;
  createdAt?: Date | null = null;
  updatedAt?: Date | null = null;
  saving = false;
  private currentUser: User | null = null;
  private currentProvidersMap = new Map<string, ProviderQuotation>();

  constructor(
    private providerService: ProviderService,
    private countryService: CountryService,
    private authService: AuthService,
    private destroy$: DestroyService,
    private inquiryService: InquiryService,
    private emailService: EmailService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
  ) {}

  get providerQuotations(): FormArray {
    return this.inquiryForm.get('providerQuotations') as FormArray;
  }

  get creator(): FormControl {
    return this.inquiryForm.get('creator') as FormControl;
  }

  get modifier(): FormControl {
    return this.inquiryForm.get('modifier') as FormControl;
  }

  async initForm() {
    const params = await firstValueFrom(this.route.params);

    if (params['id'] || this.inquiryId) {
      this.editMode = true;
      this.inquiryId = params['id'] || this.inquiryId;
      this.currentInquiry = await firstValueFrom(
        this.inquiryService.getInquiry(this.inquiryId!),
      );

      if (this.currentInquiry?.providerQuotations) {
        this.currentProvidersMap =
          this.currentInquiry.providerQuotations.reduce(
            (acc, providerQuotation) => {
              acc.set(
                providerQuotation.providerId,
                providerQuotation,
              );
              return acc;
            },
            new Map<string, ProviderQuotation>(),
          );
      }

      this.inquiryForm.patchValue({
        ...this.currentInquiry,
        id: this.currentInquiry.documentId,
        modifier: this.currentUser?.username ?? null,
        date: new Date(this.currentInquiry.date),
        customPackageOptions:
          this.currentInquiry.customPackageOptions?.split(';') || [],
      } as any);
      this.createdAt = this.currentInquiry.createdAt;
      this.updatedAt = this.currentInquiry.updatedAt;
    } else {
      this.inquiryForm.patchValue({
        creator: this.currentUser?.username ?? null,
        modifier: this.currentUser?.username ?? null,
      });
    }
  }

  async ngOnInit() {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.currentUser = user;
      });

    // Load initial data that we only need once
    this.inquiryService.getInquiryStatuses().subscribe((statuses) => {
      this.statusOptions = statuses;
    });
    await this.loadInitialData();
    await this.initForm();
  }

  saveInquiry() {
    if (this.inquiryForm.valid) {
      const formValue = this.inquiryForm.getRawValue();
      const toSave = {
        ...formValue,
        customPackageOptions: formValue.customPackageOptions,
      };

      this.saving = true;
      this.messageService.add({
        severity: 'info',
        summary: 'Saving',
        detail: `${this.editMode ? 'Updating' : 'Creating'} inquiry...`,
      });

      const request = this.editMode
        ? this.inquiryService.updateInquiry(this.inquiryId!, toSave)
        : this.inquiryService.createInquiry(toSave);

      request
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
              this.inquiryId = response.documentId;
              this.editMode = true;
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
      .filter((quotation: any) => quotation.includeInEmail && !quotation.sent)
      .map((quotation: any) => ({
        providerId: quotation.provider.documentId,
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
        sender: `${this.currentUser?.name}`,
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
      noOfPax: (inquiryData?.travelDetails.adults ?? 0) + (inquiryData?.travelDetails.children ?? 0),
      country: inquiryData?.country,
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

  getProviderQuotation(providerId: string) {
    return (
      this.currentProvidersMap.get(providerId) ?? ({} as ProviderQuotation)
    );
  }

  private async loadInitialData() {
    // Load countries
    let countriesListData = await firstValueFrom(
      this.countryService.getCountries(),
    );
    if (countriesListData) {
      this.countries = countriesListData;
    }

    // Load providers
    const providerListData = await firstValueFrom(
      this.providerService.getProviders(),
    );
    if (providerListData) {
      this.providers = providerListData;
      this.providerMap = providerListData.reduce((acc, provider) => {
        acc.set(provider.documentId!, provider);
        return acc;
      }, new Map<string, Provider>());
    }
  }

  addGroupToFormArray(group: FormGroup) {
    this.providerQuotations.push(group);
  }
}
