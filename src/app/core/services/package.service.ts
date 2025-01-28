import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { ListData } from '@models/base.model';
import { Package } from '@models/package.model';
import qs from 'qs';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PackageService {
  private baseUrl: string = environment.backendUrl + '/api/packages';

  constructor(private http: HttpClient) {}

  getPackages({
    countryId,
    providerId,
  }: {
    countryId?: string;
    providerId?: string;
  }): Observable<ListData<Package>> {
    const query = qs.stringify({
      filters: {
        countries: countryId
          ? {
              documentId: {
                $eq: countryId,
              },
            }
          : undefined,
        provider: providerId
          ? {
              documentId: {
                $eq: providerId,
              },
            }
          : undefined,
      },
      populate: {
        inclusions: {
          fields: ['*'],
        },
        exclusions: {
          fields: ['*'],
        },
        optionalTours: {
          fields: ['*'],
        },
        images: {
          fields: ['name', 'url'],
        },
      },
      sort: ['travelPeriod:desc'],
    });
    return this.http.get<ListData<Package>>(`${this.baseUrl}?${query}`);
  }
}
