import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseModel } from '@models/base.model';

export abstract class AbstractCrudService<T extends BaseModel> {
  protected abstract http: HttpClient;
  protected abstract baseUrl: string;

  getAll(): Observable<T[]> {
    return this.http.get<T[]>(`${this.baseUrl}`);
  }

  getById(id: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${id}`);
  }

  save(entity: T): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}`, entity);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  deleteMultiple(ids: string[]): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/batch`, {
      body: ids
    });
  }
}
