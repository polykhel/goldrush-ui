import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AbstractCrudComponent } from '../../../maintenance/abstract-crud.component';
import { Booking, BOOKING_STATUS_OPTIONS } from '@models/booking.model';
import { BookingService } from '@services/booking.service';
import { ToastService } from '@services/toast.service';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { CurrencyPipe, DatePipe, NgClass, NgForOf } from '@angular/common';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';

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
    NgForOf
  ],
  providers: [ConfirmationService]
})
export class BookingListComponent extends AbstractCrudComponent<Booking> {

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
    remarks: ['']
  });

  override columns = [
    {field: 'clientName', header: 'Client Name'},
    {field: 'bookingDate', header: 'Booking Date'},
    {field: 'travelStartDate', header: 'Travel Start Date'},
    {field: 'destination', header: 'Destination'},
    {field: 'totalAmount', header: 'Total Amount'},
    {field: 'paidAmount', header: 'Paid Amount'},
    {field: 'status', header: 'Status'}
  ];

  statusOptions = BOOKING_STATUS_OPTIONS;

  constructor(
    private router: Router,
    confirmationService: ConfirmationService,
    toastService: ToastService,
    service: BookingService
  ) {
    super(confirmationService, toastService, service);
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
    const option = this.statusOptions.find(opt => opt.value === status);
    return option ? option.label : status;
  }
}
