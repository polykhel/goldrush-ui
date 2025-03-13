import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Email } from '@models/email.model';
import { EmailService } from '@services/email.service';
import { ToastService } from '@services/toast.service';
import { Crud } from '@shared/components/crud/crud.component';
import { ConfirmationService, PrimeTemplate } from 'primeng/api';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Toast } from 'primeng/toast';
import { AbstractCrudComponent } from '../abstract-crud.component';

@Component({
  selector: 'app-emails',
  templateUrl: './emails.component.html',
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
    Textarea
  ],
  providers: [ConfirmationService]
})
export class EmailsComponent extends AbstractCrudComponent<Email> {
  override form = this.fb.group({
    id: new FormControl<string | null>(null),
    to: [{value: '', disabled: true}, [Validators.required]],
    subject: [{value: '', disabled: true}, [Validators.required]],
    body: [{value: '', disabled: true}, [Validators.required]]
  });

  override columns = [
    {field: 'to', header: 'To'},
    {field: 'subject', header: 'Subject'},
    {field: 'body', header: 'Body'}
  ];

  constructor(
    protected override readonly confirmationService: ConfirmationService,
    protected override readonly toastService: ToastService,
    protected override readonly service: EmailService
  ) {
    super(confirmationService, toastService, service);
  }

  override getEntityName(): string {
    return 'Email'
  }

  override getEntityDisplayName(entity: Email): string {
    return entity.to + ': ' + entity.subject;
  }

}
