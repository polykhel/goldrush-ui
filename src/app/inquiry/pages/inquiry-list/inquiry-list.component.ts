import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Inquiry } from '@models/inquiry.model';
import { Option } from '@models/option';
import { TravelDetails } from '@models/travel-details.model';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { InquiryService } from '@services/inquiry.service';
import { OptionsService } from '@services/options.service';
import { ToastService } from '@services/toast.service';
import dayjs from 'dayjs';
import { ConfirmationService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Ripple } from 'primeng/ripple';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { Toast } from 'primeng/toast';
import { Toolbar } from 'primeng/toolbar';
import { Tooltip } from 'primeng/tooltip';
import {
  debounceTime,
  distinctUntilChanged,
  firstValueFrom,
  Subject,
} from 'rxjs';

@UntilDestroy()
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
    InputText,
    FormsModule,
    Tooltip,
    Select,
    Ripple,
    Toolbar,
    IconField,
    InputIcon,
  ],
  providers: [ConfirmationService],
  templateUrl: './inquiry-list.component.html',
})
export class InquiryListComponent implements OnInit, OnDestroy {
  inquiries: Inquiry[] = [];
  first = 0;
  rows = 10;
  totalRecords = 0;
  loading = false;
  sortField: string = 'date';
  sortOrder: number = -1;
  searchTerm: string = '';
  statusOptions: Option[] = [];
  selectedStatus = '';
  private searchSubject = new Subject<string>();
  private currentPage = 0;
  private pageSize = 10;

  constructor(
    private inquiryService: InquiryService,
    private optionsService: OptionsService,
    private router: Router,
    private toastService: ToastService,
    private confirmationService: ConfirmationService,
  ) {
    this.setupSearch();
  }

  ngOnInit() {
    this.optionsService.getInquiryStatuses().subscribe((data) => {
      this.statusOptions = [{ label: 'All', value: '' }, ...data];
    });

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
    this.router.navigate(['/inquiries', inquiry.id]);
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
      if (inquiry.id == null) {
        this.toastService.error('Error', 'Cannot delete inquiry');
        return;
      }
      await firstValueFrom(this.inquiryService.deleteInquiry(inquiry.id));
      this.toastService.success('Success', 'Inquiry deleted successfully');
      this.loadInquiries();
    } catch (error) {
      this.toastService.error('Error', 'Failed to delete inquiry');
    }
  }

  async duplicateInquiry(inquiry: Inquiry) {
    try {
      if (inquiry.id == null) {
        this.toastService.error('Error', 'Cannot duplicate inquiry');
        return;
      }
      this.loading = true;
      const duplicatedInquiry = await firstValueFrom(
        this.inquiryService.duplicateInquiry(inquiry.id),
      );
      await this.router.navigate(['/inquiries', duplicatedInquiry.id], {
        state: { duplicate: true },
      });
    } catch (error) {
      this.toastService.defaultError('Failed to duplicate inquiry');
      this.loading = false;
    }
  }

  getTravelDates(travelDetails: TravelDetails) {
    let travelDates = dayjs(travelDetails.startDate).format('MMM D, YYYY');

    if (travelDetails.endDate) {
      travelDates += ' - ' + dayjs(travelDetails.endDate).format('MMM D, YYYY');
    }

    return travelDates;
  }

  getStatusLabel(status: string) {
    return this.statusOptions.find((option) => option.value === status)?.label;
  }

  private setupSearch() {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), untilDestroyed(this))
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
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response) => {
          this.inquiries = response.items;
          this.totalRecords = response.total;
          this.loading = false;
        },
        error: () => {
          this.toastService.error('Error', 'Failed to load inquiries');
          this.loading = false;
        },
      });
  }
}
