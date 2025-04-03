import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { ListData } from '@shared/models/base.model'; // Use ListData from base model
import { Expense } from '@shared/models/expense.model';
import { Observable } from 'rxjs';
import { AbstractCrudService, PageRequest } from './abstract-crud.service';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService extends AbstractCrudService<Expense> {
  // Abstract members required by AbstractCrudService
  protected http: HttpClient;
  protected baseUrl: string = environment.backendUrl + '/api/expenses';

  constructor(http: HttpClient) {
    super(); // Call the base class constructor
    this.http = http; // Assign injected HttpClient
  }

  // Override getPaginated to match backend params if needed, and use ListData
  override getPaginated(
    pageRequest: PageRequest,
  ): Observable<ListData<Expense>> {
    let params = new HttpParams()
      .set('page', pageRequest.page.toString())
      .set('size', pageRequest.size.toString())
      .set('sort', `${pageRequest.sort},${pageRequest.direction}`);

    if (pageRequest.searchTerm) {
      params = params.set('query', pageRequest.searchTerm); // Backend uses 'query' param
    }
    // Add other specific filter params if needed, e.g., category, date range

    return this.http.get<ListData<Expense>>(this.baseUrl, { params });
  }

  // Method to create expense with potential file upload (uses baseUrl)
  createExpense(formData: FormData): Observable<Expense> {
    return this.http.post<Expense>(this.baseUrl, formData);
  }

  // Method to update expense with potential file upload (uses baseUrl)
  updateExpense(id: string, formData: FormData): Observable<Expense> {
    return this.http.put<Expense>(`${this.baseUrl}/${id}`, formData);
  }

  // Method to download the receipt (uses baseUrl)
  downloadReceipt(id: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/receipt`, {
      responseType: 'blob',
    });
  }

  // Potentially add methods for fetching categories if needed
  // getExpenseCategories(): Observable<any[]> { ... }
}
