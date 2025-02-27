import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.backendUrl}/api/email`;

  sendEmail(options: EmailOptions): Observable<any> {
    console.log('email works');
    return new Observable();
    // return this.http.post(`${this.baseUrl}/send`, options);
  }
}
