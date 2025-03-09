import { Component, inject, OnInit } from '@angular/core';
import { Crud } from '@shared/components/crud/crud.component';
import {
  FormControl,
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ConfirmationService, PrimeTemplate } from 'primeng/api';
import { CountryService } from '@services/country.service';
import { Country } from '@models/country.model';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { NgIf } from '@angular/common';
import { InputText } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';
import { ToastService } from '@services/toast.service';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-countries',
  templateUrl: './countries.component.html',
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
    Toast
  ],
  providers: [ConfirmationService]
})
export class CountriesComponent implements OnInit {
  fb = inject(NonNullableFormBuilder);

  form = this.fb.group({
    id: new FormControl<string | null>(null),
    name: ['', [Validators.required]],
    code: ['', [Validators.required]]
  });

  countries: Country[] = [];

  country!: Country;

  columns = [
    {field: 'name', header: 'Name'},
    {field: 'code', header: 'Code'}
  ];

  dialogVisible = false;

  submitted: boolean = false;

  constructor(private countryService: CountryService,
              private toastService: ToastService,
              private confirmationService: ConfirmationService) {
  }

  ngOnInit() {
    this.fetchCountries();
  }

  fetchCountries() {
    this.countryService.getCountries().subscribe(countries => {
      this.countries = countries;
    });
  }

  openDialog(selectedCountry: Country) {
    this.dialogVisible = true;
    this.submitted = false;
    this.form.reset();
    this.form.patchValue(selectedCountry);
  }

  hideDialog() {
    this.dialogVisible = false;
    this.submitted = false;
  }

  saveCountry() {
    this.countryService.saveCountry(this.form.getRawValue()).subscribe({
      next: () => {
        this.hideDialog();
        this.toastService.success('Country Saved', 'The country has been saved successfully');
        this.fetchCountries();
      }
    });
  }

  deleteCountry(country: Country) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the country ${country.name}?`,
      accept: () => {
        if (country.id) {
          this.countryService.deleteCountry(country.id).subscribe({
            next: () => {
              this.toastService.success(
                'Country Deleted',
                `The country ${country.name} has been deleted successfully`);
              this.fetchCountries();
            }
          });
        }
      }
    });
  }

  deleteSelectedCountries(countries: Country[]) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the selected countries?`,
      accept: () => {
        this.countryService.deleteCountries(countries.map(country => country.id).filter(id => id !== null))
        .subscribe({
          next: () => {
            this.toastService.success(
              'Countries Deleted',
              `The countries have been deleted successfully`)
            this.fetchCountries();
          }
        })
      }
    });
  }
}
