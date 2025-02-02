import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InquiryService } from '@services/inquiry.service';
import {
  getInquiryStatusConfig,
  Inquiry,
  InquiryStatus,
} from '@models/inquiry.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { SelectButton } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Toast } from 'primeng/toast';
import {
  debounceTime,
  distinctUntilChanged,
  firstValueFrom,
  Subject,
  takeUntil,
} from 'rxjs';

@Component({
  selector: 'app-inquiry-list',
  standalone: true,
  imports: [
    TableModule,
    Toast,
    ConfirmDialog,
    Button,
    Card,
    DatePipe,
    NgForOf,
    InputGroup,
    InputGroupAddon,
    InputText,
    SelectButton,
    FormsModule,
    Tag,
    NgIf,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './inquiry-list.component.html',
})
export class InquiryListComponent implements OnInit, OnDestroy {
  inquiries: Inquiry[] = [];
  first = 0;
  rows = 10;
  totalRecords = 0;
  loading = false;
  sortField: string = 'createdAt';
  sortOrder: number = -1;
  searchTerm: string = '';
  statusOptions = [
    { label: 'ALL', value: '' },
    { label: 'NEW', value: 'NEW' },
    { label: 'PENDING', value: 'PENDING' },
    { label: 'QUOTED', value: 'QUOTED' },
    { label: 'CLOSED', value: 'CLOSED' },
  ];
  selectedStatus = '';
  protected readonly getInquiryStatusConfig = getInquiryStatusConfig;
  private searchSubject = new Subject<string>();
  private currentPage = 0;
  private pageSize = 10;

  constructor(
    private inquiryService: InquiryService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {
    this.setupSearch();
  }

  ngOnInit() {
    this.loadInquiries();
  }

  ngOnDestroy() {
    this.searchSubject.complete();
  }

  onSearch(event: any) {
    this.searchTerm = event.target.value;
    this.searchSubject.next(this.searchTerm);
  }

  onSort(event: any) {
    this.sortField = event.field;
    this.sortOrder = event.order;
    this.loadInquiries();
  }

  onPage(event: any) {
    this.currentPage = event.first / event.rows;
    this.pageSize = event.rows;
    this.loadInquiries();
  }

  onStatusChange() {
    this.loadInquiries();
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
        this.inquiryService.deleteInquiry(inquiry.documentId!),
      );
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Inquiry deleted successfully',
      });
      this.loadInquiries();
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete inquiry',
      });
    }
  }

  canGenerateQuotation(inquiry: Inquiry): boolean {
    return (
      inquiry.status === InquiryStatus.READY &&
      inquiry.providerQuotations?.some((pq) => pq.price)
    );
  }

  navigateToQuotationGenerator(inquiry: Inquiry) {
    this.router.navigate(['/quotation-generator'], {
      queryParams: { inquiryId: inquiry.id },
    });
  }

  private setupSearch() {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage = 0;
        this.loadInquiries();
      });
  }

  private loadInquiries() {
    this.loading = true;
    this.inquiryService
      .getInquiries({
        page: this.currentPage,
        pageSize: this.pageSize,
        sortField: this.sortField,
        sortOrder: this.sortOrder,
        search: this.searchTerm,
        status: this.selectedStatus,
      })
      .pipe(takeUntil(this.searchSubject))
      .subscribe({
        next: (response) => {
          this.inquiries = response.items;
          this.totalRecords = response.total;
          this.loading = false;
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load inquiries',
          });
          this.loading = false;
        },
      });
  }
}
