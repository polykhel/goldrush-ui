import { Component, inject, OnInit } from '@angular/core';
import {
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Booking, BOOKING_STATUS_OPTIONS, BookingStatus } from '@models/booking.model';
import { BookingService } from '@services/booking.service';
import { ToastService } from '@services/toast.service';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { NgIf } from '@angular/common';
import { finalize } from 'rxjs';
import { FloatLabel } from 'primeng/floatlabel';
import { Textarea } from 'primeng/textarea';
import { DatePicker } from 'primeng/datepicker';
import { Select } from 'primeng/select';
import { Checkbox } from 'primeng/checkbox';
import { RadioButton } from 'primeng/radiobutton';
import { PACKAGE_OPTIONS } from '@utils/package.util';

@Component({
  standalone: true,
  selector: 'app-booking-form',
  templateUrl: './booking-form.component.html',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    CalendarModule,
    CardModule,
    ToolbarModule,
    ToastModule,
    ConfirmDialogModule,
    NgIf,
    FloatLabel,
    Textarea,
    DatePicker,
    Select,
    Checkbox,
    RadioButton
  ],
  providers: [ConfirmationService]
})
export class BookingFormComponent implements OnInit {
  fb = inject(NonNullableFormBuilder);

  bookingForm = this.buildForm();
  booking: Booking | null = null;
  bookingId: string | null = null;
  loading = false;
  statusOptions = BOOKING_STATUS_OPTIONS;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) {
    this.bookingForm = this.buildForm();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.bookingId = params.get('id');
      if (this.bookingId) {
        this.loadBooking(this.bookingId);
      }
    });
  }

  loadBooking(id: string): void {
    this.loading = true;
    this.bookingService.getById(id)
    .pipe(finalize(() => this.loading = false))
    .subscribe({
      next: (booking) => {
        this.booking = booking;
        this.bookingForm.patchValue({
          ...booking,
          bookingDate: new Date(booking.bookingDate),
          travelStartDate: new Date(booking.travelStartDate),
          travelEndDate: new Date(booking.travelEndDate),
          customPackageOptions:
            booking.customPackageOptions?.split(';') || []
        });
        this.calculateRemainingAmount();
      },
      error: (error) => {
        this.toastService.error('Error', 'Failed to load booking details');
        console.error('Error loading booking:', error);
      }
    });
  }

  updateRemarks(): void {
    if (this.bookingForm.invalid) {
      this.toastService.warn('Validation Error', 'Please fill in all required fields correctly');
      return;
    }

    this.loading = true;

    this.bookingService.save(this.bookingForm.get('remarks')?.value)
    .pipe(finalize(() => this.loading = false))
    .subscribe({
      next: () => {
        this.toastService.success('Success', 'Booking saved successfully');
        this.router.navigate(['/bookings']);
      },
      error: (error) => {
        this.toastService.error('Error', 'Failed to save booking');
        console.error('Error saving booking:', error);
      }
    });
  }

  updateStatus(status: BookingStatus): void {
    if (!this.bookingId) return;

    this.confirmationService.confirm({
      message: `Are you sure you want to update the status to ${this.getStatusLabel(status)}?`,
      header: 'Update Status',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading = true;
        this.bookingService.updateStatus(this.bookingId!, status)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: (booking) => {
            this.booking = booking;
            this.bookingForm.patchValue({
              ...booking,
              status: booking.status
            });
            this.toastService.success('Success', `Status updated to ${this.getStatusLabel(status)}`);
          },
          error: (error) => {
            this.toastService.error('Error', 'Failed to update status');
            console.error('Error updating status:', error);
          }
        });
      }
    });
  }

  updatePayment(): void {
    if (!this.bookingId) return;

    const paidAmount = this.bookingForm.get('paidAmount')?.value;

    this.confirmationService.confirm({
      message: `Are you sure you want to update the payment amount to ${paidAmount}?`,
      header: 'Update Payment',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading = true;
        this.bookingService.updatePayment(this.bookingId!, paidAmount)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: (booking) => {
            this.booking = booking;
            this.bookingForm.patchValue({
              ...booking,
              paidAmount: booking.paidAmount,
              remainingAmount: booking.remainingAmount,
              status: booking.status
            });
            this.toastService.success('Success', 'Payment updated successfully');
          },
          error: (error) => {
            this.toastService.error('Error', 'Failed to update payment');
            console.error('Error updating payment:', error);
          }
        });
      }
    });
  }

  generateStatementOfAccount(): void {
    if (!this.bookingId) return;

    this.loading = true;
    this.bookingService.generateStatementOfAccount(this.bookingId)
    .pipe(finalize(() => this.loading = false))
    .subscribe({
      next: (response) => {
        this.bookingForm.patchValue({
          statementOfAccountUrl: response.url
        });
        this.toastService.success('Success', 'Statement of Account generated successfully');
        window.open(response.url, '_blank');
      },
      error: (error) => {
        this.toastService.error('Error', 'Failed to generate Statement of Account');
        console.error('Error generating Statement of Account:', error);
      }
    });
  }

  calculateRemainingAmount(): void {
    const totalAmount = this.bookingForm.get('totalAmount')?.value || 0;
    const paidAmount = this.bookingForm.get('paidAmount')?.value || 0;
    const remainingAmount = Math.max(0, totalAmount - paidAmount);

    this.bookingForm.patchValue({
      remainingAmount
    });
  }

  getStatusLabel(status: string): string {
    const option = this.statusOptions.find(opt => opt.value === status);
    return option ? option.label : status;
  }

  goBack(): void {
    this.router.navigate(['/bookings']);
  }

  private buildForm(): FormGroup {
    return this.fb.group({
      id: [null],
      inquiryId: [{value: null, disabled: true}, Validators.required],
      clientName: [{value: null, disabled: true}, Validators.required],
      bookingDate: [new Date(), Validators.required],
      travelStartDate: [{value: null, disabled: true}, Validators.required],
      travelEndDate: [{value: null, disabled: true}, Validators.required],
      destination: [{value: null, disabled: true}, Validators.required],
      packageType: [{value: null, disabled: true}, Validators.required],
      customPackageOptions: [{value: null, disabled: true}],
      totalAmount: [{value: 0, disabled: true}, [Validators.required, Validators.min(0)]],
      paidAmount: [0, [Validators.required, Validators.min(0)]],
      remainingAmount: [{value: 0, disabled: true}, [Validators.required, Validators.min(0)]],
      status: [{ value: BookingStatus.PENDING_PAYMENT, disabled: true}, Validators.required],
      statementOfAccountUrl: [''],
      remarks: ['']
    });
  }

  protected readonly packageOptions = PACKAGE_OPTIONS;
}
