export interface FileResponse {
  fileName: string;
  fileContent: Blob;
  contentType: string;
}

export enum ReportFormat {
  PDF = 'PDF',
  EXCEL = 'EXCEL',
  CSV = 'CSV',
}
