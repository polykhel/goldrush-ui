import { Component } from '@angular/core';
import { Crud } from '@shared/components/crud/crud.component';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, PrimeTemplate } from 'primeng/api';
import { ProviderService } from '@services/provider.service';
import { Provider } from '@models/provider.model';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { NgIf } from '@angular/common';
import { InputText } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';
import { ToastService } from '@services/toast.service';
import { Toast } from 'primeng/toast';
import { AbstractCrudComponent } from '../abstract-crud.component';
import { CountryService } from '@services/country.service';
import { Country } from '@models/country.model';
import { MultiSelect } from 'primeng/multiselect';

@Component({
  selector: 'app-providers',
  templateUrl: './providers.component.html',
  standalone: true,
  imports: [
    Crud,
    FormsModule,
    Dialog,
    PrimeTemplate,
    Button,
    NgIf,
    InputText,
    ReactiveFormsModule,
    FloatLabel,
    Toast,
    MultiSelect
  ],
  providers: [ConfirmationService]
})
export class ProvidersComponent extends AbstractCrudComponent<Provider> {
  override form = this.fb.group({
    id: new FormControl<string | null>(null),
    name: ['', [Validators.required]],
    trackerLink: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    logo: [''],
    countries: [[] as string[]]
  });

  override columns = [
    {field: 'name', header: 'Name'},
    {field: 'email', header: 'Email'},
    {field: 'trackerLink', header: 'Tracker Link'}
  ];

  availableCountries: Country[] = [];
  selectedCountries: Country[] = [];

  constructor(
    protected override readonly confirmationService: ConfirmationService,
    protected override readonly toastService: ToastService,
    protected override readonly service: ProviderService,
    private countryService: CountryService
  ) {
    super(confirmationService, toastService, service);
  }

  override ngOnInit() {
    super.ngOnInit();
    this.fetchAvailableCountries();
  }

  fetchAvailableCountries() {
    this.countryService.getCountries().subscribe(countries => {
      this.availableCountries = countries;
    });
  }

  override openDialog(selectedProvider: Provider) {
    this.dialogVisible = true;
    this.submitted = false;
    this.form.reset();

    if (selectedProvider.id) {
      // For existing provider, fetch the latest data from the server
      this.service.getById(selectedProvider.id).subscribe(provider => {
        // Patch the form with the fetched provider data
        this.form.patchValue({
          ...provider
        });

        // Handle countries selection
        if (provider.countries && provider.countries.length > 0) {
          // Fetch the country objects based on IDs
          this.selectedCountries = this.availableCountries.filter(country =>
            country.id !== null && provider.countries.includes(country.id)
          );

          // If no countries were found but IDs exist, it might be because availableCountries
          // hasn't loaded yet, so we'll retry once
          if (this.selectedCountries.length === 0 && this.availableCountries.length === 0) {
            this.countryService.getCountries().subscribe(countries => {
              this.availableCountries = countries;
              this.selectedCountries = this.availableCountries.filter(country =>
                country.id !== null && provider.countries.includes(country.id)
              );

              // Update the form with the country IDs
              this.form.get('countries')?.setValue(
                this.selectedCountries.map(country => country.id).filter(id => id !== null)
              );
            });
          } else {
            // Update the form with the country IDs
            this.form.get('countries')?.setValue(
              this.selectedCountries.map(country => country.id).filter(id => id !== null)
            );
          }
        } else {
          this.selectedCountries = [];
          this.form.get('countries')?.setValue([]);
        }
      });
    } else {
      // For new provider
      this.form.patchValue({
        ...selectedProvider
      });
      this.selectedCountries = [];
      this.form.get('countries')?.setValue([]);
    }
  }

  onCountrySelectionChange(event: { value: Country[] }) {
    const selectedCountryIds = event.value.map(country => country.id).filter(id => id !== null);
    this.form.get('countries')?.setValue(selectedCountryIds);
  }

  override getEntityName(): string {
    return 'Provider';
  }

  override getEntityDisplayName(entity: Provider): string {
    return entity.name;
  }
}
