import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseModel, ListData } from '@models/base.model';

export interface PageRequest {
  page: number;
  size: number;
  sort?: string;
  direction?: 'asc' | 'desc';
  searchTerm?: string;
}

export abstract class AbstractCrudService<T extends BaseModel> {
  protected abstract http: HttpClient;
  protected abstract baseUrl: string;

  getAll(): Observable<T[]> {
    return this.http.get<T[]>(`${this.baseUrl}`);
  }

  getPaginated(pageRequest: PageRequest): Observable<ListData<T>> {
    let params = new HttpParams()
      .set('page', pageRequest.page.toString())
      .set('size', pageRequest.size.toString());

    if (pageRequest.sort) {
      params = params.set('sort', `${pageRequest.sort},${pageRequest.direction ?? 'asc'}`);
    }

    if (pageRequest.searchTerm) {
      params = params.set('search', pageRequest.searchTerm);
    }

    return this.http.get<ListData<T>>(`${this.baseUrl}`, { params });
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
