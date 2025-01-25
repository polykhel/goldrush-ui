import { DatePipe, NgForOf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InquiryService } from '@core/services/inquiry.service';
import { Inquiry } from '@models/inquiry.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { Toast } from 'primeng/toast';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-inquiry-list',
  standalone: true,
  imports: [TableModule, Toast, ConfirmDialog, Button, Card, DatePipe, NgForOf],
  providers: [MessageService, ConfirmationService],
  templateUrl: './inquiry-list.component.html',
})
export class InquiryListComponent implements OnInit {
  inquiries: Inquiry[] = [];
  first = 0;
  rows = 10;
  totalRecords = 0;
  loading = false;

  constructor(
    private inquiryService: InquiryService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {}

  ngOnInit() {
    this.loadInquiries();
  }

  async loadInquiries(event?: any) {
    try {
      this.loading = true;
      const page = event ? (event.first / event.rows) + 1 : 1;
      const response = await firstValueFrom(
        this.inquiryService.getInquiries({
          page,
          pageSize: event?.rows || this.rows,
          sort: [event?.sortField ? `${event.sortField}:${event.sortOrder === 1 ? 'asc' : 'desc'}` : 'createdAt:desc']
        })
      );
      this.inquiries = response.data;
      this.totalRecords = response.meta.pagination.total;
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load inquiries'
      });
    } finally {
      this.loading = false;
    }
  }

  createInquiry() {
    this.router.navigate(['/inquiries/new']);
  }

  editInquiry(inquiry: Inquiry) {
    this.router.navigate(['/inquiries', inquiry.documentId]);
  }

  confirmDelete(inquiry: Inquiry) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the inquiry for ${inquiry.clientName}?`,
      accept: () => {
        this.deleteInquiry(inquiry);
      },
    });
  }

  async deleteInquiry(inquiry: Inquiry) {
    try {
      await firstValueFrom(
        this.inquiryService.deleteInquiry(inquiry.documentId),
      );
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Inquiry deleted successfully',
      });
      await this.loadInquiries();
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete inquiry',
      });
    }
  }

  onPage(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.loadInquiries(event);
  }
}
