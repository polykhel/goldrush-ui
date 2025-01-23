import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CountryService } from '@core/services/country.service';
import { DestroyService } from '@core/services/destroy.service';
import { PackageService } from '@core/services/package.service';
import { ProviderService } from '@core/services/provider.service';
import { environment } from '@env/environment';
import { Asset } from '@models/asset.model';
import { Country } from '@models/country.model';
import { Package } from '@models/package.model';
import { Provider } from '@models/provider.model';
import { Quotation } from '@models/quotation.model';
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
import { merge, takeUntil } from 'rxjs';

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
  ],
  templateUrl: './quotation-form.component.html',
  styleUrl: './quotation-form.component.css',
})
export class QuotationFormComponent implements OnInit {
  @Output() onFormChange: EventEmitter<Quotation> = new EventEmitter();
  countries?: Country[];
  providers?: Provider[];
  packages?: Package[];
  images?: Asset[] | null;
  private baseUrl = environment.backendUrl;
  private formBuilder = inject(FormBuilder);
  form = this.formBuilder.group({
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
    modeOfTransportation: this.formBuilder.control<string | null>(null, [
      Validators.required,
    ]),
    flightIncluded: this.formBuilder.control<boolean>(true, [
      Validators.required,
    ]),
    airline: this.formBuilder.control<string | null>(null),
    departure: this.formBuilder.control<string | null>(null),
    arrival: this.formBuilder.control<string | null>(null),
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
  });

  constructor(
    private countryService: CountryService,
    private providerService: ProviderService,
    private packageService: PackageService,
    private destroy$: DestroyService,
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
    this.country.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((country) => {
        this.provider.reset();
        this.package.reset();
        if (country) {
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
        if (provider && this.country.value) {
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

    merge(this.ratePerPax.valueChanges, this.totalFlightPrice.valueChanges, this.flightIncluded.valueChanges)
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
  }

  fetchProvidersByCountry(country: string): void {
    this.providerService.getProvidersByCountry(country).subscribe((data) => {
      this.providers = data.data;
    });
  }

  fetchPackagesByCountryAndProvider(country: string, provider: string): void {
    this.packageService
      .getPackagesByCountryAndProvider(country, provider)
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

  generate() {
    let value = this.form.value;

    const flightDetails: string[] = [];
    if (value.departure) {
      flightDetails.push(value.departure);
    }
    if (value.arrival) {
      flightDetails.push(value.arrival);
    }

    this.onFormChange.emit({
      title: value.title,
      travelDates: value.travelDates,
      ratePerPax: value.suggestedRatePerPax,
      noOfPax: value.noOfPax,
      inclusions: value.inclusions?.split('\n'),
      exclusions: value.exclusions?.split('\n'),
      optionalActivities: value.optionalTours?.split('\n'),
      airline: value.airline,
      flightDetails: flightDetails,
      images: this.images,
    });
  }
}
