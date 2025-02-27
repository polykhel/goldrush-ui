import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Quotation } from '@models/quotation.model';
import { QuotationService } from '@services/quotation.service';
import { ToastService } from '@services/toast.service';
import dayjs from 'dayjs';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-quotation-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TooltipModule, TagModule],
  templateUrl: './quotation-list.component.html',
})
export class QuotationListComponent implements OnInit {
  quotations: Quotation[] = [];
  first = 0;
  rows = 10;
  totalRecords = 0;
  loading = false;
  sortField: string = 'createdAt';
  sortOrder: number = -1;
  private currentPage = 0;
  private pageSize = 10;

  constructor(
    private router: Router,
    private quotationService: QuotationService,
    private toastService: ToastService,
  ) {}

  ngOnInit() {
    this.loadQuotations();
  }

  formatDate(date: Date | string | undefined) {
    if (!date) return '';
    return dayjs(date).format('MMM D, YYYY');
  }

  loadQuotations() {
    this.loading = true;
    this.quotationService
      .getQuotations({
        page: this.currentPage,
        pageSize: this.pageSize,
        sortField: this.sortField,
        sortOrder: this.sortOrder,
      })
      .subscribe({
        next: (data) => {
          this.quotations = data.items;
          this.totalRecords = data.total;
          this.loading = false;
        },
        error: () => {
          this.toastService.error('Error', 'Failed to load quotations');
          this.loading = false;
        },
      });
  }

  onSort(event: any) {
    this.sortField = event.field;
    this.sortOrder = event.order;
    this.loadQuotations();
  }

  onPage(event: any) {
    this.currentPage = event.first / event.rows;
    this.pageSize = event.rows;
    this.loadQuotations();
  }

  editQuotation(quotation: Quotation) {
    this.router.navigate(['/quotations/', quotation.documentId]);
  }

  deleteQuotation(quotation: Quotation) {
    if (confirm('Are you sure you want to delete this quotation?')) {
      this.quotationService.deleteQuotation(quotation.documentId!).subscribe({
        next: () => {
          this.loadQuotations();
        },
      });
    }
  }
}
