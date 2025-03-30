import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FileResponse, ReportFormat } from '@models/report.model';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { BaseReportComponent } from '../../components/base-report/base-report.component';
import { ReportFilterComponent } from '../../components/report-filter/report-filter.component';

@Component({
  selector: 'app-commission-report',
  standalone: true,
  imports: [
    CommonModule,
    ReportFilterComponent,
    ProgressSpinnerModule,
    ToastModule,
  ],
  templateUrl: './commission-report.component.html'
})
export class CommissionReportComponent extends BaseReportComponent {
  constructor() {
    super();
    this.reportTitle = 'Commission Report';
  }

  protected generateReportFile(
    startDate: Date,
    endDate: Date,
    format: ReportFormat
  ): void {
    this.financialReportService
      .generateCommissionReport(startDate, endDate, format)
      .subscribe({
        next: (response) => this.downloadFile(new FileResponse(response)),
        error: (error) => this.handleError(error),
      });
  }
}
