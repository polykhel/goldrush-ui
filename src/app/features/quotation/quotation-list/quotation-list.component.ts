import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { QuotationService } from '@services/quotation.service';
import { Quotation } from '@models/quotation.model';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import dayjs from 'dayjs';

@Component({
  selector: 'app-quotation-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TooltipModule, TagModule],
  templateUrl: './quotation-list.component.html'
})
export class QuotationListComponent implements OnInit {
  quotations: Quotation[] = [];
  loading = false;
  private router = inject(Router);
  private quotationService = inject(QuotationService);

  ngOnInit() {
    this.loadQuotations();
  }

  loadQuotations() {
    this.loading = true;
    this.quotationService.getQuotations().subscribe({
      next: (data) => {
        this.quotations = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  formatDate(date: Date | string | undefined) {
    if (!date) return '';
    return dayjs(date).format('MMM D, YYYY');
  }

  createNew() {
    this.router.navigate(['/quotations/new']);
  }

  editQuotation(quotation: Quotation) {
    this.router.navigate(['/quotations/', quotation.documentId]);
  }

  deleteQuotation(quotation: Quotation) {
    if (confirm('Are you sure you want to delete this quotation?')) {
      this.quotationService.deleteQuotation(quotation.documentId!).subscribe({
        next: () => {
          this.loadQuotations();
        }
      });
    }
  }
}
