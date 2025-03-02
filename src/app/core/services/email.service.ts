import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

export interface EmailOptions {
  to: string;
  subject: string;
  content: string;
}

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.backendUrl}/email`;

  sendEmail(options: EmailOptions): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}`, options);
  }
}
