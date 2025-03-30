import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReportFormat } from '@models/report.model';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';

@Component({
  selector: 'app-report-filter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DatePicker,
    Button,
    Select,
  ],
  templateUrl: './report-filter.component.html'
})
export class ReportFilterComponent {
  @Input() title = 'Report';
  @Output() generateReport = new EventEmitter<{
    startDate: Date;
    endDate: Date;
    format: ReportFormat;
  }>();

  filterForm: FormGroup;
  exportFormats = [
    { label: 'PDF', value: ReportFormat.PDF },
    { label: 'Excel', value: ReportFormat.EXCEL },
  ];

  constructor(private fb: FormBuilder) {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    this.filterForm = this.fb.group({
      dateRange: this.fb.group({
        startDate: [firstDayOfMonth, Validators.required],
        endDate: [today, Validators.required],
      }),
      format: [ReportFormat.PDF, Validators.required],
    });
  }

  onSubmit(): void {
    if (this.filterForm.valid) {
      const formValues = this.filterForm.value;
      this.generateReport.emit({
        startDate: formValues.dateRange.startDate,
        endDate: formValues.dateRange.endDate,
        format: formValues.format,
      });
    }
  }
}
