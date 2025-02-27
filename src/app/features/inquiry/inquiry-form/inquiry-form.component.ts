import { DatePipe, Location, NgForOf, NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuditFields } from '@models/base.model';
import { Country } from '@models/country.model';
import { Inquiry, InquiryStatus, } from '@models/inquiry.model';
import { Provider } from '@models/provider.model';
import { CountryService } from '@services/country.service';
import { DestroyService } from '@services/destroy.service';
import { EmailService } from '@services/email.service';
import { InquiryService } from '@services/inquiry.service';
import { ProviderService } from '@services/provider.service';
import { ToastService } from '@services/toast.service';
import { EmailData, prepareProviderEmail } from '@utils/email.util';
import { PACKAGE_OPTIONS } from '@utils/package.util';
import dayjs from 'dayjs';
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
import { ProviderQuotation, ProviderQuotationEmailRequest } from '@models/provider-quotation.model';
import { ProviderQuotationService } from '@services/provider-quotation.service';

@Component({
  selector: 'app-inquiry-form',
  imports: [ReactiveFormsModule, RadioButton, DatePicker, FloatLabel, InputText, InputNumber, NgForOf, Button, NgIf, Textarea, DropdownModule, Select, Fluid, DatePipe, Toast, EmailPreviewModalComponent, ProviderQuotationComponent, Checkbox, FormsModule,],
  templateUrl: './inquiry-form.component.html',
})
export class InquiryFormComponent implements OnInit {
  fb = inject(FormBuilder);

  editMode = false;
  showEmailPreview = false;
  emailData: EmailData | null = null;
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
  providerQuotationRequest: ProviderQuotationEmailRequest | null = null;

  constructor(private providerService: ProviderService, private countryService: CountryService, private destroy$: DestroyService, private inquiryService: InquiryService, private providerQuotationService: ProviderQuotationService, private emailService: EmailService, private toastService: ToastService, private route: ActivatedRoute, private location: Location, private router: Router,) {
  }

  get quotations(): FormArray {
    return this.inquiryForm.get('quotations') as FormArray;
  }

  get childrenControl(): FormControl {
    return this.inquiryForm.get('travelDetails.children') as FormControl;
  }

  getProviderQuotationControl(index: number): FormGroup {
    return this.quotations.at(index) as FormGroup;
  }

  buildForm() {
    return this.fb.group({
      id: new FormControl<string | null>(null),
      status: this.fb.nonNullable.control<string>('NEW', [Validators.required]),
      date: this.fb.nonNullable.control<Date>(new Date(), [Validators.required,]),
      clientName: this.fb.nonNullable.control<string>('', [Validators.required,]),
      source: this.fb.nonNullable.control<string>('', [Validators.required]),
      travelDetails: this.fb.group({
        countryId: this.fb.nonNullable.control<string>(null!, [Validators.required,]),
        destination: this.fb.nonNullable.control<string>('', [Validators.required,]),
        days: this.fb.nonNullable.control<number>(null!, [Validators.required]),
        nights: this.fb.nonNullable.control<number>(null!, [Validators.required,]),
        startDate: this.fb.nonNullable.control<Date>(null!, [Validators.required,]),
        endDate: this.fb.nonNullable.control<Date>(null!, [Validators.required,]),
        preferredHotel: [''],
        adults: this.fb.nonNullable.control<number>(null!, [Validators.required,]),
        children: this.fb.nonNullable.control<number>(null!, [Validators.required,]),
        childAges: new FormControl<string | null>(null),
      }),
      packageType: this.fb.nonNullable.control<string>('ALL_INCLUSIVE', [Validators.required,]),
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

    const id = params['id'];
    if (id) {
      this.editMode = true;
      this.inquiryId = id;
      this.currentInquiry = await firstValueFrom(this.inquiryService.getInquiry(id),);
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
        });
      }

      this.inquiryForm.patchValue({
        ...this.currentInquiry, date: new Date(this.currentInquiry.date), travelDetails: {
          ...this.currentInquiry.travelDetails,
          startDate: new Date(this.currentInquiry.travelDetails.startDate),
          endDate: new Date(this.currentInquiry.travelDetails.endDate),
        }, customPackageOptions: this.currentInquiry.customPackageOptions?.split(';') || [],
      });
    }
  }

  saveInquiry() {
    if (this.inquiryForm.valid) {
      const formValue = this.inquiryForm.getRawValue();
      const toSave = {
        ...formValue, customPackageOptions: formValue.customPackageOptions?.join(';') ?? null,
      };

      this.saving = true;
      this.toastService.info('Saving', `${this.editMode ? 'Updating' : 'Creating'} inquiry...`,);

      this.inquiryService
      .saveInquiry(toSave)
      .pipe(finalize(() => (this.saving = false)), takeUntil(this.destroy$),)
      .subscribe({
        next: (response) => {
          this.toastService.success('Success', 'Inquiry saved successfully');

          if (!this.editMode) {
            this.editMode = true;
            this.inquiryId = response.id!;
            this.router.navigate(['/inquiries', this.inquiryId]);
          } else {
            this.auditFields = {
              ...this.auditFields, updatedBy: response.updatedBy, updatedAt: response.updatedAt,
            };
          }
        }, error: (error) => {
          this.toastService.defaultError('Failed to save inquiry');
          console.error('Error saving inquiry:', error);
        },
      });
    } else {
      this.toastService.warn('Validation Error', 'Please fill in all required fields',);
    }
  }

  openEmailModal(providerQuotation: ProviderQuotation) {
    if (this.inquiryForm.valid) {
      const inquiry = this.inquiryForm.getRawValue();
      const provider = this.providerMap.get(providerQuotation.providerId);

      if (!provider) {
        this.toastService.warn('Validation Error', 'Provider not found.');
        return;
      }

      this.providerQuotationRequest = {
        providerId: providerQuotation.providerId,
        dateRange: {
          start: inquiry.travelDetails.startDate, end: inquiry.travelDetails.endDate,
        },
        travelDays: inquiry.travelDetails.days,
        travelNights: inquiry.travelDetails.nights,
        destination: inquiry.travelDetails.destination,
        paxAdult: inquiry.travelDetails.adults,
        paxChild: inquiry.travelDetails.children,
        paxChildAges: inquiry.travelDetails.childAges,
        packageType: inquiry.packageType,
        customPackageOptions: inquiry.customPackageOptions?.join(';'),
        preferredHotel: inquiry.travelDetails.preferredHotel,
        emailRemarks: providerQuotation.emailQuotation,
        sender: this.auditFields.createdBy ?? 'Goldrush',
        sent: providerQuotation.sent,
        to: provider?.email,
      };

      this.emailData = prepareProviderEmail(this.providerQuotationRequest);
      this.showEmailPreview = true;
    } else {
      this.toastService.warn('Validation Error', 'Please fill in all required field',);
    }
  }

  handleSendEmail() {
    if (!this.emailData || !this.providerQuotationRequest) {
      this.toastService.warn('Validation Error', 'Email data not found',);
      return;
    }

    this.isSending = true;
    this.emailService.sendEmail({
      to: this.providerQuotationRequest.to,
      subject: this.emailData?.subject,
      content: this.emailData?.emailContent,
    }).subscribe({
      next: () => {
        this.quotations.controls.forEach((control) => {
          const providerId = control.get('providerId')?.value;
          if (providerId === this.providerQuotationRequest?.providerId) {
            control.patchValue({
              sent: true,
            });

            this.providerQuotationService.updateProviderQuotation(control.get('id')?.value, {
              emailQuotation: control.get('emailQuotation')?.value, sent: true
            })
            .subscribe();
          }
        });

        this.toastService.success('Emails sent successfully');
        this.showEmailPreview = false;
      }, error: (error) => {
        this.toastService.defaultError('Failed to send emails');
        console.error('Error sending emails:', error);
      }, complete: () => {
        this.isSending = false;
      }
    });
  }

  generateQuotation(providerQuotationId: string) {
    if (!this.inquiryId) {
      this.toastService.warn('Inquiry not saved yet', 'Please save inquiry first before generating',);
    }

    this.router.navigate(['/quotations/new'], {
      queryParams: {
        fromInquiry: this.inquiryId,
        fromProvider: providerQuotationId,
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
      exchangeRate: [{value: quotation?.exchangeRate ?? null, disabled: true},],
      exchangeRateLastUpdated: [{
        value: quotation?.exchangeRateLastUpdated ?? null,
        disabled: true
      },],
      phpEquivalentAmount: [{value: quotation?.phpEquivalentAmount ?? null, disabled: true},],
      internalRemarks: [quotation?.internalRemarks ?? null],
      emailQuotation: [quotation?.emailQuotation ?? null],
      sent: [quotation?.sent ?? false],
      status: [quotation?.status ?? 'PENDING'],
    });
  }

  addQuotation() {
    if (this.selectedProvider && !this.quotations.controls.some((control) => control.get('providerId')?.value === this.selectedProvider,)) {
      const provider = this.providerMap.get(this.selectedProvider);
      if (provider) {
        const group = this.buildProviderQuotationForm();
        group.controls.providerId.setValue(this.selectedProvider);

        this.quotations.push(group);
        this.selectedProvider = null;
        this.updateAvailableProviders();
      }
    }
  }

  removeQuotation(index: number) {
    this.quotations.removeAt(index);
    this.updateAvailableProviders();
  }

  calculateTravelDuration() {
    const travelDetails = this.inquiryForm.get('travelDetails');
    if (!travelDetails) return;

    const startDate = travelDetails.get('startDate')?.value;
    const endDate = travelDetails.get('endDate')?.value;

    if (startDate && endDate) {
      const start = dayjs(startDate);
      const end = dayjs(endDate);

      if (start.isBefore(end)) {
        const days = end.diff(start, 'days') + 1;
        const nights = days - 1;

        travelDetails.get('days')?.setValue(days);
        travelDetails.get('nights')?.setValue(nights);
      }
    }
  }

  private updateAvailableProviders() {
    const usedProviders = new Set(this.quotations.controls.map((control) => control.get('providerId')?.value,),);
    this.availableProviders = this.providers.filter((provider) => !usedProviders.has(provider.id),);
  }

  private async loadInitialData() {
    this.statusOptions = await firstValueFrom(this.inquiryService.getInquiryStatuses(),);

    this.countries = await firstValueFrom(this.countryService.getCountries());

    const providerListData = await firstValueFrom(this.providerService.getProviders(),);
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
