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
import { EmailData, prepareProviderEmail } from '@core/utils/email.util';
import { Country } from '@models/country.model';
import {
  getInquiryStatusConfig,
  Inquiry,
  InquiryStatus,
  ProviderQuotation,
  ProviderQuotationRequest,
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
import { Tag } from 'primeng/tag';
import { Textarea } from 'primeng/textarea';
import { Toast } from 'primeng/toast';
import { firstValueFrom, takeUntil } from 'rxjs';
import { EmailPreviewModalComponent } from '../../components/email-preview-modal/email-preview-modal.component';
import { ProviderQuotationComponent } from '../../components/provider-quotation/provider-quotation.component';

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
    Tag,
    ProviderQuotationComponent,
  ],
  templateUrl: './inquiry-form.component.html',
  providers: [MessageService],
})
export class InquiryFormComponent implements OnInit {
  formBuilder = inject(FormBuilder);
  isEditMode = false;
  showEmailPreview = false;
  emailData = new Map<string, EmailData>();
  isSending = false;

  inquiryForm = this.formBuilder.group({
    id: [null],
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
    packageType: this.formBuilder.control<string>('allIn'),
    otherServices: [''],
    providerQuotations: this.formBuilder.array<ProviderQuotation>([]),
    remarks: [''],
    inquiryStatus: this.formBuilder.control<InquiryStatus>(InquiryStatus.NEW),
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
  countries: Country[] = [];
  providers: Provider[] = [];
  providerMap = new Map<string, Provider>();
  inquiryStatusOptions = [
    { label: 'New', value: 'NEW', class: 'text-blue-600' },
    { label: 'Pending', value: 'PENDING', class: 'text-yellow-600' },
    { label: 'Quoted', value: 'QUOTED', class: 'text-green-600' },
  ];
  currentInquiry: Inquiry | null = null;
  protected readonly getInquiryStatusConfig = getInquiryStatusConfig;
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

    this.countryService.getCountries().subscribe((response) => {
      this.countries = response.data;
    });

    let countriesListData = await firstValueFrom(this.countryService.getCountries());
    if (countriesListData) {
      this.countries = countriesListData.data;
    }

    if (params['id']) {
      this.isEditMode = true;
      this.currentInquiry = await firstValueFrom(
        this.inquiryService.getInquiry(params['id']),
      );
      this.inquiryForm.patchValue({
        ...this.currentInquiry,
        id: this.currentInquiry.documentId,
        modifier: this.currentUser?.username ?? null,
        date: new Date(this.currentInquiry.date),
        dateRanges: this.currentInquiry.dateRanges.map((dateRange) => ({
          start: new Date(dateRange.start),
          end: new Date(dateRange.end),
        })),
      } as any);
    } else {
      this.inquiryForm.patchValue({
        creator: this.currentUser?.username ?? null,
        modifier: this.currentUser?.username ?? null,
      });
    }

    const providerListData = await firstValueFrom(
      this.providerService.getProviders()
    );
    if (providerListData) {
      this.providers = providerListData.data;

      this.providerMap = providerListData.data.reduce((acc, provider) => {
        acc.set(provider.documentId!, provider);
        return acc;
      }, new Map<string, Provider>());

      if (this.currentInquiry?.providerQuotations) {
        this.currentProvidersMap =
          this.currentInquiry?.providerQuotations.reduce(
            (acc, providerQuotation) => {
              acc.set(providerQuotation.provider.documentId!, providerQuotation);
              return acc;
            },
            new Map<string, ProviderQuotation>(),
          );
      }
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

  saveInquiry() {
    if (this.inquiryForm.valid) {
      const formValue = this.inquiryForm.getRawValue();

      this.inquiryService.saveInquiry(formValue).subscribe({
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

  mapProviderQuotations(inquiry: any): ProviderQuotationRequest[] {
    return inquiry.providerQuotations
      .filter((quotation: any) => quotation.includeInEmail && !quotation.sent)
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

  getProviderQuotation(providerId: string) {
    return (
      this.currentProvidersMap.get(providerId) ?? ({} as ProviderQuotation)
    );
  }

  generateQuotation(providerQuotation: ProviderQuotation) {
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
    };

    this.router.navigate(['/quotations/new'], {
      queryParams: {
        data: btoa(JSON.stringify(quotationData))
      }
    });
  }
}
