import { HttpResponse } from '@angular/common/http';

export enum ReportFormat {
  PDF = 'PDF',
  EXCEL = 'EXCEL',
  WORD = 'WORD',
  RTF = 'RTF',
}

export class FileResponse {
  fileName: string;
  fileContent: Blob | string;
  contentType: string;

  constructor(private response: HttpResponse<Blob>) {
    this.fileContent = response.body || '';
    this.contentType = response.headers.get('content-type') || '';
    this.fileName =
      response.headers
        .get('Content-Disposition')
        ?.split(';')[1]
        ?.split('=')[1] || '';
  }
}
