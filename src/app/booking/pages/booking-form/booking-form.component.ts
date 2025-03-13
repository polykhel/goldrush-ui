import { DecimalPipe, NgIf } from '@angular/common';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CanComponentDeactivate } from '@core/guards/can-deactivate.guard';
import { Booking, BOOKING_STATUS_OPTIONS, BookingStatus, PaymentHistory, PriceBreakdown } from '@models/booking.model';
import { Option } from '@models/option';
import { BookingService } from '@services/booking.service';
import { OptionsService } from '@services/options.service';
import { ToastService } from '@services/toast.service';
import { PACKAGE_OPTIONS } from '@utils/package.util';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { Checkbox } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePicker } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { FloatLabel } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButton } from 'primeng/radiobutton';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { Textarea } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { finalize, Observable } from 'rxjs';

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
    RadioButton,
    TableModule,
    DialogModule,
    DecimalPipe
  ],
  providers: [ConfirmationService]
})
export class BookingFormComponent implements OnInit, CanComponentDeactivate {
  fb = inject(NonNullableFormBuilder);

  bookingForm = this.buildForm();
  paymentForm = this.buildPaymentForm();
  priceBreakdownForm = this.buildPriceBreakdownForm();

  booking: Booking | null = null;
  bookingId: string | null = null;
  loading = false;
  statusOptions = BOOKING_STATUS_OPTIONS;

  priceBreakdownDialogVisible = false;

  // Local copies for editing
  localPaymentHistory: PaymentHistory[] = [];
  localPriceBreakdown: PriceBreakdown[] = [];
  hasUnsavedChanges = false;

  paymentMethods: Option[] = [];

  isEditingPayment = false;
  editingPaymentIndex: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService,
    private optionsService: OptionsService,
  ) {
  }

  // Handle browser navigation/refresh/close
  @HostListener('window:beforeunload', ['$event'])
  handleBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.hasUnsavedChanges) {
      event.preventDefault();
      // noinspection JSDeprecatedSymbols
      event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
    }
  }

  // Method for CanDeactivate guard
  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    if (!this.hasUnsavedChanges) {
      return true;
    }

    return new Promise<boolean>(resolve => {
      this.confirmationService.confirm({
        message: 'You have unsaved changes. Are you sure you want to leave?',
        header: 'Unsaved Changes',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          resolve(true);
        },
        reject: () => {
          resolve(false);
        }
      });
    });
  }

  ngOnInit(): void {
    this.optionsService
      .getPaymentMethods()
      .subscribe((data) => (this.paymentMethods = data));

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
        this.localPaymentHistory = [...(booking.paymentHistory || [])];
        this.localPriceBreakdown = [...(booking.priceBreakdown || [])];

        this.bookingForm.patchValue({
          ...booking,
          bookingDate: new Date(booking.bookingDate),
          travelStartDate: new Date(booking.travelStartDate),
          travelEndDate: new Date(booking.travelEndDate),
          customPackageOptions:
            booking.customPackageOptions?.split(';') || []
        });

        this.calculateTotals();
        this.hasUnsavedChanges = false;
      },
      error: (error) => {
        this.toastService.error('Error', 'Failed to load booking details');
        console.error('Error loading booking:', error);
      }
    });
  }

  saveBooking(): void {
    if (this.bookingForm.invalid) {
      this.toastService.warn('Validation Error', 'Please fill in all required fields correctly');
      return;
    }

    if (!this.bookingId || !this.booking) return;

    this.loading = true;

    const updatedBooking = {
      remarks: this.bookingForm.get('remarks')?.value,
      paymentHistory: this.localPaymentHistory,
      priceBreakdown: this.localPriceBreakdown,
      totalAmount: this.calculateTotalAmount(),
      paidAmount: this.calculatePaidAmount(),
      remainingAmount: this.calculateRemainingAmount(),
      status: this.determineBookingStatus()
    };

    this.bookingService.update(this.bookingId, updatedBooking)
    .pipe(finalize(() => this.loading = false))
    .subscribe({
      next: (booking: Booking) => {
        this.booking = booking;
        this.localPaymentHistory = [...(booking.paymentHistory || [])];
        this.localPriceBreakdown = [...(booking.priceBreakdown || [])];

        this.bookingForm.patchValue({
          ...booking,
          totalAmount: booking.totalAmount,
          paidAmount: booking.paidAmount,
          remainingAmount: booking.remainingAmount,
          status: booking.status,
          customPackageOptions: booking.customPackageOptions?.split(';') ?? []
        });

        this.hasUnsavedChanges = false;
        this.toastService.success('Success', 'Booking saved successfully');
      },
      error: (error: any) => {
        this.toastService.error('Error', 'Failed to save booking');
        console.error('Error saving booking:', error);
      }
    });
  }

  openPriceBreakdownDialog(): void {
    this.priceBreakdownForm = this.buildPriceBreakdownForm();
    this.priceBreakdownDialogVisible = true;
  }

  resetPaymentForm(): void {
    this.isEditingPayment = false;
    this.editingPaymentIndex = null;
    this.paymentForm.reset();
    this.paymentForm.patchValue({
      date: new Date(),
      paymentMethod: 'CASH',
      amount: 0,
      remarks: ''
    });
  }

  openEditPaymentDialog(payment: PaymentHistory, index: number): void {
    // Only allow editing payments without an ID (new payments not yet saved to server)
    if (payment.id) {
      this.toastService.warn('Cannot Edit', 'Payments already saved to the server cannot be edited');
      return;
    }

    this.isEditingPayment = true;
    this.editingPaymentIndex = index;

    // Populate the form with existing payment data
    this.paymentForm.patchValue({
      date: new Date(payment.date),
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      remarks: payment.remarks || ''
    });
  }

  deletePayment(index: number): void {
    const payment = this.localPaymentHistory[index];

    // Only allow deleting payments without an ID (new payments not yet saved to server)
    if (payment.id) {
      this.toastService.warn('Cannot Delete', 'Payments already saved to the server cannot be deleted');
      return;
    }

    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this payment?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.localPaymentHistory.splice(index, 1);
        this.calculateTotals();
        this.hasUnsavedChanges = true;
        this.toastService.info('Info', 'Payment deleted. Remember to save your changes.');
      }
    });
  }

  addPayment(): void {
    if (this.paymentForm.invalid) {
      this.toastService.warn('Validation Error', 'Please fill in all required fields correctly');
      return;
    }

    const payment: PaymentHistory = {
      id: null,
      date: this.formatDate(this.paymentForm.get('date')?.value),
      amount: this.paymentForm.get('amount')?.value || 0,
      paymentMethod: this.paymentForm.get('paymentMethod')?.value || '',
      remarks: this.paymentForm.get('remarks')?.value
    };

    if (this.isEditingPayment && this.editingPaymentIndex !== null) {
      // Update existing payment
      this.localPaymentHistory[this.editingPaymentIndex] = payment;
      this.isEditingPayment = false;
      this.editingPaymentIndex = null;
    } else {
      // Add new payment
      this.localPaymentHistory.push(payment);
    }

    this.calculateTotals();
    this.hasUnsavedChanges = true;
    this.resetPaymentForm(); // Reset the form after adding
    this.toastService.info('Info', `Payment ${this.isEditingPayment ? 'updated' : 'added'}. Remember to save your changes.`);
  }

  addPriceBreakdown(): void {
    if (this.priceBreakdownForm.invalid) {
      this.toastService.warn('Validation Error', 'Please fill in all required fields correctly');
      return;
    }

    const priceBreakdown: PriceBreakdown = {
      label: this.priceBreakdownForm.get('label')?.value || '',
      amount: this.priceBreakdownForm.get('amount')?.value || 0,
      quantity: this.priceBreakdownForm.get('quantity')?.value || 1,
      total: 0
    };

    priceBreakdown.total = priceBreakdown.amount * priceBreakdown.quantity;

    this.localPriceBreakdown.push(priceBreakdown);
    this.calculateTotals();
    this.hasUnsavedChanges = true;
    this.priceBreakdownDialogVisible = false;
    this.toastService.info('Info', 'Price breakdown added. Remember to save your changes.');
  }

  deletePriceBreakdown(index: number): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this price breakdown item?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.localPriceBreakdown.splice(index, 1);
        this.calculateTotals();
        this.hasUnsavedChanges = true;
        this.toastService.info('Info', 'Price breakdown deleted. Remember to save your changes.');
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
        if (response?.status !== 200 || !response.body || response.body.size === 0) {
          this.toastService.warn('Warning', 'No data found for Statement of Account');
          return;
        }

        const fileName = response.headers.get('Content-Disposition')?.split(';')[1]?.split('=')[1];

        this.toastService.success('Success', 'Statement of Account generated successfully');
        const fileURL = URL.createObjectURL(response.body);
        const a = document.createElement('a');
        a.href = fileURL;
        a.target = '_blank';
        a.download = fileName ?? 'statement-of-account.pdf';
        document.body.appendChild(a); // Required for Firefox
        a.click();
        document.body.removeChild(a); // Clean up
        URL.revokeObjectURL(fileURL); // Release the object URL
      },
      error: (error) => {
        this.toastService.error('Error', 'Failed to generate Statement of Account');
        console.error('Error generating Statement of Account:', error);
      }
    });
  }

  calculateTotals(): void {
    const totalAmount = this.calculateTotalAmount();
    const paidAmount = this.calculatePaidAmount();
    const remainingAmount = Math.max(0, totalAmount - paidAmount);
    const status = this.determineBookingStatus();

    this.bookingForm.patchValue({
      totalAmount,
      paidAmount,
      remainingAmount,
      status
    });
  }

  calculateTotalAmount(): number {
    return this.localPriceBreakdown.reduce((total, item) => {
      return total + item.total;
    }, 0);
  }

  calculatePaidAmount(): number {
    return this.localPaymentHistory.reduce((total, payment) => {
      return total + payment.amount;
    }, 0);
  }

  calculateRemainingAmount(): number {
    const totalAmount = this.calculateTotalAmount();
    const paidAmount = this.calculatePaidAmount();
    return Math.max(0, totalAmount - paidAmount);
  }

  determineBookingStatus(): BookingStatus {
    const totalAmount = this.calculateTotalAmount();
    const paidAmount = this.calculatePaidAmount();

    if (paidAmount <= 0) {
      return BookingStatus.PENDING_PAYMENT;
    } else if (paidAmount >= totalAmount) {
      return BookingStatus.FULLY_PAID;
    } else {
      return BookingStatus.PARTIALLY_PAID;
    }
  }

  goBack(): void {
    if (this.hasUnsavedChanges) {
      this.confirmationService.confirm({
        message: 'You have unsaved changes. Are you sure you want to leave?',
        header: 'Unsaved Changes',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.router.navigate(['/bookings']);
        }
      });
    } else {
      this.router.navigate(['/bookings']);
    }
  }

  getPaymentMethodLabel(value: string): string {
    return this.paymentMethods.find(paymentMethod => paymentMethod.value = value)?.label ?? '';
  }

  private formatDate(date?: Date): string {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  }

  private buildForm() {
    return this.fb.group({
      id: this.fb.control<string | null>(null),
      inquiryId: this.fb.control<string>({value: '', disabled: true}, Validators.required),
      clientName: this.fb.control<string>({value: '', disabled: true}, Validators.required),
      bookingDate: this.fb.control<Date>(new Date(), Validators.required),
      travelStartDate: this.fb.control<Date>({value: new Date(), disabled: true}, Validators.required),
      travelEndDate: this.fb.control<Date>({value: new Date(), disabled: true}, Validators.required),
      destination: this.fb.control<string>({value: '', disabled: true}, Validators.required),
      packageType: this.fb.control<string>({value: '', disabled: true}, Validators.required),
      customPackageOptions: this.fb.control<string[]>({value: [], disabled: true}),
      totalAmount: this.fb.control<number>({value: 0, disabled: true}, [Validators.required, Validators.min(0)]),
      paidAmount: this.fb.control<number>({value: 0, disabled: true}, [Validators.required, Validators.min(0)]),
      remainingAmount: this.fb.control<number>({value: 0, disabled: true}, [Validators.required, Validators.min(0)]),
      status: this.fb.control<BookingStatus>({
        value: BookingStatus.PENDING_PAYMENT,
        disabled: true
      }, Validators.required),
      remarks: this.fb.control<string>('')
    });
  }

  private buildPaymentForm() {
    return this.fb.group({
      date: this.fb.control<Date>(new Date(), Validators.required),
      amount: this.fb.control<number>(0, [Validators.required, Validators.min(1)]),
      paymentMethod: this.fb.control<string>('CASH', Validators.required),
      remarks: this.fb.control<string>('')
    });
  }

  private buildPriceBreakdownForm() {
    return this.fb.group({
      label: this.fb.control<string>('', Validators.required),
      amount: this.fb.control<number>(0, [Validators.required, Validators.min(1)]),
      quantity: this.fb.control<number>(1, [Validators.required, Validators.min(1)]),
      total: this.fb.control<number>(0)
    });
  }

  protected readonly packageOptions = PACKAGE_OPTIONS;
}
