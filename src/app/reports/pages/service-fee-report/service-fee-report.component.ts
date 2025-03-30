import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { BaseReportComponent } from '../../components/base-report/base-report.component';
import { ReportFilterComponent } from '../../components/report-filter/report-filter.component';
import { FileResponse, ReportFormat } from '@models/report.model';

@Component({
  selector: 'app-service-fee-report',
  standalone: true,
  imports: [
    CommonModule,
    ReportFilterComponent,
    ProgressSpinnerModule,
    ToastModule,
  ],
  templateUrl: './service-fee-report.component.html'
})
export class ServiceFeeReportComponent extends BaseReportComponent {
  constructor() {
    super();
    this.reportTitle = 'Service Fee Report';
  }

  protected generateReportFile(
    startDate: Date,
    endDate: Date,
    format: ReportFormat
  ): void {
    this.financialReportService
      .generateServiceFeeReport(startDate, endDate, format)
      .subscribe({
        next: (response) => this.downloadFile(new FileResponse(response)),
        error: (error) => this.handleError(error),
      });
  }
}
