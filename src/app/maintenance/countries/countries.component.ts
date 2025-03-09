import { Component, inject } from '@angular/core';
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
import { AbstractCrudComponent } from '../abstract-crud.component';

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
export class CountriesComponent extends AbstractCrudComponent<Country> {
  protected override fb = inject(NonNullableFormBuilder);

  override form = this.fb.group({
    id: new FormControl<string | null>(null),
    name: ['', [Validators.required]],
    code: ['', [Validators.required]]
  });

  override columns = [
    {field: 'name', header: 'Name'},
    {field: 'code', header: 'Code'}
  ];

  constructor(
    protected override readonly confirmationService: ConfirmationService,
    protected override readonly toastService: ToastService,
    protected override readonly service: CountryService
  ) {
    super(confirmationService, toastService, service);
  }

  override getEntityName(): string {
    return 'Country';
  }

  override getEntityDisplayName(entity: Country): string {
    return entity.name;
  }
}
