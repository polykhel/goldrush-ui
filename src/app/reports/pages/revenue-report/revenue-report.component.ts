import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FileResponse, ReportFormat } from '@models/report.model';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { BaseReportComponent } from '../../components/base-report/base-report.component';
import { ReportFilterComponent } from '../../components/report-filter/report-filter.component';

@Component({
  selector: 'app-revenue-report',
  standalone: true,
  imports: [
    CommonModule,
    ReportFilterComponent,
    ProgressSpinnerModule,
    ToastModule,
  ],
  templateUrl: './revenue-report.component.html'
})
export class RevenueReportComponent extends BaseReportComponent {
  constructor() {
    super();
    this.reportTitle = 'Revenue Report';
  }

  protected generateReportFile(
    startDate: Date,
    endDate: Date,
    format: ReportFormat
  ): void {
    this.financialReportService
      .generateRevenueReport(startDate, endDate, format)
      .subscribe({
        next: (response) => {
          console.log(response);
          this.downloadFile(new FileResponse(response))
        },
        error: (error) => this.handleError(error),
      });
  }
}
