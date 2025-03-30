import { Component, inject } from '@angular/core';
import { FinancialReportService } from '@core/services/financial-report.service';
import { FileResponse, ReportFormat } from '@models/report.model';
import { MessageService } from 'primeng/api';
import {saveAs} from 'file-saver';

@Component({
  template: '',
})
export abstract class BaseReportComponent {
  protected financialReportService = inject(FinancialReportService);
  protected messageService = inject(MessageService);

  loading = false;
  reportTitle = 'Report';

  protected abstract generateReportFile(
    startDate: Date,
    endDate: Date,
    format: ReportFormat
  ): void;

  protected handleReportGeneration(event: {
    startDate: Date;
    endDate: Date;
    format: ReportFormat;
  }): void {
    this.loading = true;
    this.generateReportFile(event.startDate, event.endDate, event.format);
  }

  protected downloadFile(response: FileResponse): void {
    try {
      console.log(response);
      saveAs(response.fileContent, response.fileName);
      this.loading = false;
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Report generated successfully',
      });
    } catch (error) {
      this.loading = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to generate report',
      });
      console.error('Error downloading file:', error);
    }
  }

  protected handleError(error: any): void {
    this.loading = false;
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to generate report',
    });
    console.error('Error generating report:', error);
  }
}
