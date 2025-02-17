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
    clientName: ['', [Validators.required]],
    date: [new Date(), [Validators.required]],
    contactPoint: this.formBuilder.control<string | null>(null),
    contactPointOther: [''],
    travelDays: [null, [Validators.required]],
    travelNights: [null, [Validators.required]],
    country: [null, [Validators.required]],
    destination: [null, [Validators.required]],
    dateRanges: this.formBuilder.array<{ start: Date; end: Date }[]>([]),
    preferredHotel: [null],
    paxAdult: [null, [Validators.required]],
    paxChild: [null, [Validators.required]],
    paxChildAges: [''],
    packageType: ['all-inclusive'],
    customPackageOptions: [[] as string[]],
    otherServices: [''],
    providerQuotations: this.formBuilder.array<ProviderQuotation>([]),
    remarks: [''],
    inquiryStatus: this.formBuilder.control<string>('NEW'),
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
  ) {
    this.addDateRange();
  }

  get dateRanges(): FormArray {
    return this.inquiryForm.get('dateRanges') as FormArray;
  }

  get providerQuotations(): FormArray {
    return this.inquiryForm.get('providerQuotations') as FormArray;
  }

  get creator(): FormControl {
    return this.inquiryForm.get('creator') as FormControl;
  }

  get modifier(): FormControl {
    return this.inquiryForm.get('modifier') as FormControl;
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
                providerQuotation.provider.documentId!,
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
        dateRanges: this.currentInquiry.dateRanges.map((dateRange) => ({
          start: new Date(dateRange.start),
          end: new Date(dateRange.end),
        })),
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

  saveInquiry() {
    if (this.inquiryForm.valid) {
      const formValue = this.inquiryForm.getRawValue();
      const toSave = {
        ...formValue,
        customPackageOptions: formValue.customPackageOptions?.join(';'),
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
      destination: inquiryData.destination,
      title: `${inquiryData?.travelDays}D${inquiryData?.travelNights}N ${inquiryData?.destination} Package`,
      travelDates: inquiryData?.dateRanges,
      ratePerPax:
        providerQuotation.currency === 'PHP'
          ? providerQuotation.price
          : providerQuotation.phpEquivalent,
      noOfPax: (inquiryData?.paxAdult ?? 0) + (inquiryData?.paxChild ?? 0),
      country: inquiryData?.country,
      provider: providerQuotation.provider,
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
