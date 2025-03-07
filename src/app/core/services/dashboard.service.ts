import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { Dashboard } from '@models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private baseUrl: string = environment.backendUrl + '/api/dashboard';

  getDashboard() {
    return this.http.get<Dashboard>(this.baseUrl);
  }
}
