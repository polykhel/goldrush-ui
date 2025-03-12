import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { AbstractCrudService } from '@services/abstract-crud.service';
import { Email } from '@models/email.model';

export interface EmailOptions {
  to: string;
  subject: string;
  content: string;
}

@Injectable({
  providedIn: 'root',
})
export class EmailService extends AbstractCrudService<Email> {
  protected http = inject(HttpClient);
  protected baseUrl = `${environment.backendUrl}/api/email`;

  sendEmail(options: EmailOptions): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}`, options);
  }
}
