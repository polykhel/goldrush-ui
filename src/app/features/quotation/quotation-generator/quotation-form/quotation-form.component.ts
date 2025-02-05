import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { formatPairedValues, formatValue } from '@utils/string.util';
import { environment } from '@env/environment';
import { Asset } from '@models/asset.model';
import { Country } from '@models/country.model';
import { Package } from '@models/package.model';
import { Provider } from '@models/provider.model';
import { Quotation } from '@models/quotation.model';
import { CountryService } from '@services/country.service';
import { DestroyService } from '@services/destroy.service';
import { PackageService } from '@services/package.service';
import { ProviderService } from '@services/provider.service';
import dayjs from 'dayjs';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { DatePicker } from 'primeng/datepicker';
import { FloatLabel } from 'primeng/floatlabel';
import { Fluid } from 'primeng/fluid';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { RadioButton } from 'primeng/radiobutton';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { finalize, merge, takeUntil } from 'rxjs';
import { QuotationService } from '@services/quotation.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { PACKAGE_OPTIONS } from '@utils/package.util';
import { Card } from 'primeng/card';

type FlightDetail = Partial<{
  flightNumber: string | null;
  iataCode: string | null;
  date: Date | null;
  startTime: Date | null;
  endTime: Date | null;
}>;

@Component({
  selector: 'app-quotation-form',
  imports: [
    CommonModule,
    DatePicker,
    FloatLabel,
    Fluid,
    ReactiveFormsModule,
    InputNumber,
    Button,
    Select,
    Checkbox,
    InputText,
    RadioButton,
    Textarea,
    ToastModule,
    Card,
  ],
  templateUrl: './quotation-form.component.html',
  providers: [MessageService],
})
export class QuotationFormComponent implements OnInit {
  @Output() onFormChange: EventEmitter<any> = new EventEmitter();
  countries: Country[] = [];
  providers: Provider[] = [];
  packages: Package[] = [];
  images?: Asset[] | null;
  saving = false;
  editMode = false;
  quotationId?: string;
  packageOptions = PACKAGE_OPTIONS;
  private baseUrl = environment.backendUrl;
  private formBuilder = inject(FormBuilder);
  form = this.formBuilder.group({
    clientName: this.formBuilder.control<string | null>(null),
    destination: this.formBuilder.control<string | null>(null),
    country: this.formBuilder.control<Country | null>(null, [
      Validators.required,
    ]),
    provider: this.formBuilder.control<Provider | null>({
      value: null,
      disabled: true,
    }),
    package: this.formBuilder.control<Package | null>({
      value: null,
      disabled: true,
    }),
    title: this.formBuilder.control<string | null>(null, [Validators.required]),
    travelDates: this.formBuilder.control<Date[] | null>(null, [
      Validators.required,
    ]),
    noOfPax: this.formBuilder.control<number | null>(null, [
      Validators.required,
    ]),
    modeOfTransportation: this.formBuilder.control<string | null>('Flight', [
      Validators.required,
    ]),
    flightIncluded: this.formBuilder.control<boolean>(true, [
      Validators.required,
    ]),
    airline: this.formBuilder.control<string | null>(null),
    departure: this.formBuilder.group({
      flightNumber: this.formBuilder.control<string | null>(null),
      iataCode: this.formBuilder.control<string | null>('MNL'),
      date: this.formBuilder.control<Date | null>(null),
      startTime: this.formBuilder.control<Date | null>(null),
      endTime: this.formBuilder.control<Date | null>(null),
    }),
    arrival: this.formBuilder.group({
      flightNumber: this.formBuilder.control<string | null>(null),
      iataCode: this.formBuilder.control<string | null>('MNL'),
      date: this.formBuilder.control<Date | null>(null),
      startTime: this.formBuilder.control<Date | null>(null),
      endTime: this.formBuilder.control<Date | null>(null),
    }),
    arrivalPrice: this.formBuilder.control<number | null>(null),
    departurePrice: this.formBuilder.control<number | null>(null),
    totalFlightPrice: this.formBuilder.control<number | null>({
      value: null,
      disabled: true,
    }),
    ratePerPax: this.formBuilder.control<number | null>(null, [
      Validators.required,
    ]),
    totalRatePerPax: this.formBuilder.control<number | null>(
      { value: null, disabled: true },
      [Validators.required],
    ),
    suggestedRatePerPax: this.formBuilder.control<number | null>(null, [
      Validators.required,
    ]),
    inclusions: this.formBuilder.control<string | null>(null),
    exclusions: this.formBuilder.control<string | null>(null),
    optionalTours: this.formBuilder.control<string | null>(null),
    packageType: ['all-inclusive'],
    customPackageOptions: [[] as string[]],
  });

  constructor(
    private countryService: CountryService,
    private providerService: ProviderService,
    private packageService: PackageService,
    private quotationService: QuotationService,
    private messageService: MessageService,
    private destroy$: DestroyService,
    private route: ActivatedRoute,
  ) {}

  get country() {
    return this.form.controls.country;
  }

  get provider() {
    return this.form.controls.provider;
  }

  get package() {
    return this.form.controls.package;
  }

  get departurePrice() {
    return this.form.controls.departurePrice;
  }

  get arrivalPrice() {
    return this.form.controls.arrivalPrice;
  }

  get totalFlightPrice() {
    return this.form.controls.totalFlightPrice;
  }

  get ratePerPax() {
    return this.form.controls.ratePerPax;
  }

  get flightIncluded() {
    return this.form.controls.flightIncluded;
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      if (params['id']) {
        this.editMode = true;
        this.quotationId = params['id'];
        this.loadQuotation(params['id']);
      }
    });

    this.country.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((country) => {
        this.provider.reset();
        this.package.reset();
        if (country?.documentId) {
          this.fetchProvidersByCountry(country.documentId);
          this.provider.enable();
        } else {
          this.provider.disable();
          this.package.disable();
        }
      });

    this.provider.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((provider) => {
        this.package.reset();
        if (provider?.documentId && this.country.value?.documentId) {
          this.fetchPackagesByCountryAndProvider(
            this.country.value.documentId,
            provider.documentId,
          );
          this.package.enable();
        } else {
          this.package.disable();
        }
      });

    merge(this.departurePrice.valueChanges, this.arrivalPrice.valueChanges)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.calculateTotalFlightPrice();
      });

    merge(
      this.ratePerPax.valueChanges,
      this.totalFlightPrice.valueChanges,
      this.flightIncluded.valueChanges,
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.calculateTotalRatePerPax();
      });

    this.countryService.getCountries().subscribe((data) => {
      this.countries = data.data;
    });

    this.package.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        if (data) {
          this.updateDetails(data);
        }
      });

    this.form.controls.travelDates.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((travelDates) => {
        if (travelDates) {
          if (travelDates[0]) {
            this.form.controls.departure.controls.date.setValue(travelDates[0]);
          } else {
            this.form.controls.departure.controls.date.setValue(null);
          }

          if (travelDates[1]) {
            this.form.controls.arrival.controls.date.setValue(travelDates[1]);
          } else {
            this.form.controls.arrival.controls.date.setValue(null);
          }
        } else {
          this.form.controls.departure.controls.date.setValue(null);
          this.form.controls.arrival.controls.date.setValue(null);
        }
      });

    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        if (params['data']) {
          try {
            const quotationData = JSON.parse(atob(params['data']));

            if (quotationData.country) {
              this.country.setValue(quotationData.country);
              this.fetchProvidersByCountry(quotationData.country.documentId);

              setTimeout(() => {
                const provider = this.providers.find(
                  (p) => p.documentId === quotationData.provider.documentId,
                );
                this.provider.setValue(provider ?? null);
              }, 500);
            }

            this.form.patchValue({
              clientName: quotationData.clientName,
              destination: quotationData.destination,
              title: quotationData.title,
              travelDates: quotationData.travelDates.map((range: any) => [
                new Date(range.start),
                new Date(range.end),
              ])[0],
              ratePerPax: quotationData.ratePerPax,
              noOfPax: quotationData.noOfPax,
              packageType: quotationData.packageType,
              customPackageOptions: quotationData.customPackageOptions,
            });
          } catch (e) {
            console.error('Error parsing quotation data:', e);
          }
        }
      });
  }

  loadQuotation(id: string) {
    this.quotationService.getQuotation(id).subscribe({
      next: (response) => {
        const quotation = response.data;

        if (quotation.country) {
          this.country.setValue(quotation.country);
        }

        if (quotation.provider) {
          this.provider.setValue(quotation.provider);
        }

        const travelDates = quotation.travelDates
          ? [
              new Date(quotation.travelDates.start),
              new Date(quotation.travelDates.end),
            ]
          : null;

        this.form.patchValue({
          clientName: quotation.clientName,
          destination: quotation.destination,
          title: quotation.title,
          travelDates,
          noOfPax: quotation.noOfPax,
          modeOfTransportation: quotation.modeOfTransportation,
          flightIncluded: quotation.flightIncluded,
          airline: quotation.airline,
          departure: {
            ...quotation.departure,
            date: quotation.departure?.date
              ? new Date(quotation.departure?.date)
              : null,
            startTime: quotation.departure?.startTime
              ? new Date(quotation.departure?.startTime)
              : null,
            endTime: quotation.departure?.endTime
              ? new Date(quotation.departure?.endTime)
              : null,
          },
          arrival: { ...quotation.arrival },
          departurePrice: quotation.departurePrice,
          arrivalPrice: quotation.arrivalPrice,
          ratePerPax: quotation.ratePerPax,
          suggestedRatePerPax: quotation.suggestedRatePerPax,
          inclusions: quotation.inclusions,
          exclusions: quotation.exclusions,
          optionalTours: quotation.optionalTours,
          packageType: quotation.packageType,
          customPackageOptions:
            quotation.customPackageOptions?.split(';') || [],
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load quotation',
        });
      },
    });
  }

  fetchProvidersByCountry(country: string): void {
    this.providerService.getProvidersByCountry(country).subscribe((data) => {
      this.providers = data.data;
    });
  }

  fetchPackagesByCountryAndProvider(
    countryId: string,
    providerId: string,
  ): void {
    this.packageService
      .getPackages({ countryId, providerId })
      .subscribe((data) => {
        this.packages = data.data;
      });
  }

  calculateTotalFlightPrice(): void {
    const departurePrice = this.departurePrice.value ?? 0;
    const arrivalPrice = this.arrivalPrice.value ?? 0;
    this.totalFlightPrice.setValue(departurePrice + arrivalPrice);
  }

  calculateTotalRatePerPax(): void {
    if (this.flightIncluded.value) {
      this.form.controls.totalRatePerPax.setValue(this.ratePerPax.value);
      this.form.controls.suggestedRatePerPax.setValue(this.ratePerPax.value);
      return;
    }

    const ratePerPax = this.ratePerPax.value ?? 0;
    const totalFlightPrice = this.totalFlightPrice.value ?? 0;
    const total = totalFlightPrice + ratePerPax;
    this.form.controls.totalRatePerPax.setValue(total);
    this.form.controls.suggestedRatePerPax.setValue(this.roundPrice(total));
  }

  roundPrice(price: number) {
    const thousands = Math.floor(price / 1000);
    const remainder = price % 1000;

    if (remainder >= 500) {
      return (thousands + 1) * 1000;
    } else {
      return thousands * 1000 + 500;
    }
  }

  updateDetails(pkg: Package) {
    if (pkg.price) {
      this.ratePerPax.setValue(pkg.price);
    }

    if (pkg.inclusions) {
      const value = pkg.inclusions.map((data) => data.title).join('\n');
      this.form.controls.inclusions.setValue(value);
    }

    if (pkg.exclusions) {
      const value = pkg.exclusions.map((data) => data.title).join('\n');
      this.form.controls.exclusions.setValue(value);
    }

    if (pkg.optionalTours) {
      const value = pkg.optionalTours.map((data) => data.title).join('\n');
      this.form.controls.optionalTours.setValue(value);
    }

    if (pkg.images) {
      this.images = pkg.images.map((img) => {
        img.url = `${this.baseUrl}${img.url}`;
        return img;
      });
    }

    this.form.controls.title.setValue(
      `${pkg.duration} ${pkg.name} All-in Package`,
    );
  }

  getFlightDetails(flightDetail: FlightDetail, nextCode?: string | null) {
    const date = flightDetail.date
      ? dayjs(flightDetail.date).format('MM/DD/YY')
      : '';
    const startTime = flightDetail.startTime
      ? dayjs(flightDetail.startTime).format('HH:mm')
      : '';
    const endTime = flightDetail.endTime
      ? dayjs(flightDetail.endTime).format('HH:mm')
      : '';
    const route = formatPairedValues(flightDetail.iataCode, nextCode);
    const timeRange = formatPairedValues(startTime, endTime);

    return [
      formatValue(flightDetail.flightNumber),
      route,
      formatValue(date),
      timeRange,
    ]
      .filter(Boolean)
      .join(' ');
  }

  generate() {
    if (this.form.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields before previewing',
      });
      return;
    }

    const value = this.form.value;

    const flightDetails: string[] = [];
    if (value.departure) {
      const departureDetails = this.getFlightDetails(
        value.departure,
        value.arrival?.iataCode,
      );
      if (departureDetails) flightDetails.push(departureDetails);
    }
    if (value.arrival) {
      const arrivalDetails = this.getFlightDetails(
        value.arrival,
        value.departure?.iataCode,
      );
      if (arrivalDetails) flightDetails.push(arrivalDetails);
    }

    this.messageService.add({
      severity: 'info',
      summary: 'Preview Generated',
      detail: 'Generating preview of the quotation',
    });

    this.onFormChange.emit({
      title: value.title,
      travelDates: value.travelDates,
      ratePerPax: value.suggestedRatePerPax,
      noOfPax: value.noOfPax,
      inclusions: value.inclusions,
      exclusions: value.exclusions,
      optionalTours: value.optionalTours,
      airline: value.airline,
      flightDetails: flightDetails,
      images: this.images,
    });
  }

  save() {
    if (this.form.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields',
      });
      return;
    }

    this.saving = true;
    this.messageService.add({
      severity: 'info',
      summary: 'Saving',
      detail: `${this.editMode ? 'Updating' : 'Creating'} quotation...`,
    });

    const formValue = this.form.value;
    const travelDates = formValue.travelDates
      ? {
          start: dayjs(formValue.travelDates[0]).toDate(),
          end: dayjs(formValue.travelDates[1]).toDate(),
        }
      : undefined;

    const quotation: Quotation = {
      clientName: formValue.clientName,
      destination: formValue.destination,
      country: formValue.country,
      provider: formValue.provider,
      package: formValue.package,
      title: formValue.title,
      travelDates,
      noOfPax: formValue.noOfPax,
      modeOfTransportation: formValue.modeOfTransportation,
      flightIncluded: formValue.flightIncluded,
      airline: formValue.airline,
      departure: { ...formValue.departure },
      arrival: { ...formValue.arrival },
      departurePrice: formValue.departurePrice,
      arrivalPrice: formValue.arrivalPrice,
      totalFlightPrice: this.totalFlightPrice.value,
      ratePerPax: formValue.ratePerPax,
      totalRatePerPax: this.form.controls.totalRatePerPax.value,
      suggestedRatePerPax: formValue.suggestedRatePerPax,
      inclusions: formValue.inclusions,
      exclusions: formValue.exclusions,
      optionalTours: formValue.optionalTours,
      images: this.images,
      packageType: formValue.packageType,
      customPackageOptions: formValue.customPackageOptions?.join(';'),
    };

    const request = this.editMode
      ? this.quotationService.updateQuotation(this.quotationId!, quotation)
      : this.quotationService.createQuotation(quotation);

    request
      .pipe(
        finalize(() => (this.saving = false)),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Quotation ${this.editMode ? 'updated' : 'created'} successfully`,
          });
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `Failed to ${this.editMode ? 'update' : 'create'} quotation: ${error.message || 'Unknown error occurred'}`,
          });
        },
      });
  }
}
