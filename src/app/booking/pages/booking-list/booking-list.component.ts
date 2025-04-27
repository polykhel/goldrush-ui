import { CurrencyPipe, DatePipe, NgClass, NgForOf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Booking } from '@models/booking.model';
import { Option } from '@models/option';
import { BookingService } from '@services/booking.service';
import { OptionsService } from '@services/options.service';
import { ToastService } from '@services/toast.service';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { IconField } from 'primeng/iconfield';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { AbstractCrudComponent } from '../../../maintenance/abstract-crud.component';

@Component({
  standalone: true,
  selector: 'app-booking-list',
  templateUrl: './booking-list.component.html',
  imports: [
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    CardModule,
    ToolbarModule,
    ToastModule,
    ConfirmDialogModule,
    DatePipe,
    CurrencyPipe,
    NgClass,
    InputGroup,
    InputGroupAddon,
    NgForOf,
    IconField,
    InputIcon,
  ],
  providers: [ConfirmationService],
})
export class BookingListComponent
  extends AbstractCrudComponent<Booking>
  implements OnInit
{
  form: FormGroup = this.fb.group({
    id: [null],
    clientName: [''],
    bookingDate: [new Date()],
    travelStartDate: [new Date()],
    travelEndDate: [new Date()],
    destination: [''],
    packageType: [''],
    totalAmount: [0],
    paidAmount: [0],
    remainingAmount: [0],
    status: ['PENDING_PAYMENT'],
    remarks: [''],
  });

  override columns = [
    { field: 'clientName', header: 'Client Name' },
    { field: 'bookingDate', header: 'Booking Date' },
    { field: 'travelStartDate', header: 'Travel Start Date' },
    { field: 'destination', header: 'Destination' },
    { field: 'totalAmount', header: 'Total Amount' },
    { field: 'paidAmount', header: 'Paid Amount' },
    { field: 'status', header: 'Status' },
  ];

  statusOptions: Option[] = [];

  constructor(
    private router: Router,
    confirmationService: ConfirmationService,
    toastService: ToastService,
    service: BookingService,
    private optionsService: OptionsService,
  ) {
    super(confirmationService, toastService, service);
  }

  override ngOnInit() {
    super.ngOnInit();
    this.optionsService.getBookingStatuses().subscribe((data) => {
      this.statusOptions = data;
    });
  }

  override getEntityName(): string {
    return 'Booking';
  }

  override getEntityDisplayName(entity: Booking): string {
    return entity.clientName;
  }

  viewBooking(booking: Booking): void {
    this.router.navigate(['/bookings', booking.id]);
  }

  getStatusLabel(status: string): string {
    const option = this.statusOptions.find((opt) => opt.value === status);
    return option ? option.label : status;
  }
}
