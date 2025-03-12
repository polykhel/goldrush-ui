import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, PrimeTemplate } from 'primeng/api';
import { Textarea } from 'primeng/textarea';
import { AbstractCrudComponent } from '../abstract-crud.component';
import { Email } from '@models/email.model';
import { ToastService } from '@services/toast.service';
import { EmailService } from '@services/email.service';
import { Crud } from '@shared/components/crud/crud.component';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { NgIf } from '@angular/common';
import { InputText } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';
import { Toast } from 'primeng/toast';

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
    to: ['', [Validators.required]],
    subject: ['', [Validators.required]],
    body: ['', [Validators.required]]
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
