import { DecimalPipe, NgIf } from '@angular/common';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CanComponentDeactivate } from '@core/guards/can-deactivate.guard';
import { Booking, BookingStatus, PaymentHistory, PriceBreakdown } from '@models/booking.model';
import { Option } from '@models/option';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
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
import { distinctUntilChanged, finalize, Observable } from 'rxjs';

@UntilDestroy()
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
  statusOptions: Option[] = [];

  bookingForm = this.buildForm();
  paymentForm = this.buildPaymentForm();
  priceBreakdownForm = this.buildPriceBreakdownForm();

  booking: Booking | null = null;
  bookingId: string | null = null;
  loading = false;
  editingPriceBreakdownIndex: number | null = null;

  // Local copies for editing
  localPaymentHistory: PaymentHistory[] = [];
  localPriceBreakdown: PriceBreakdown[] = [];
  hasUnsavedChanges = false;

  paymentMethods: Option[] = [];
  paymentTypes: Option[] = [];
  salutations: Option[] = [];

  isEditingPayment = false;
  editingPaymentIndex: number | null = null;

  protected readonly packageOptions = PACKAGE_OPTIONS;

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
    this.optionsService.getPaymentMethods().subscribe(data => {
      this.paymentMethods = data;
    });

    this.optionsService.getBookingStatuses().subscribe(data => {
      this.statusOptions = data;
    });

    this.optionsService.getPaymentTypes().subscribe(data => {
      this.paymentTypes = data;
    });

    this.optionsService.getSalutations().subscribe(data => {
      this.salutations = data;
    });

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

          this.resetPaymentForm();

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
      salutation: this.bookingForm.get('salutation')?.value,
      modeOfPayment: this.bookingForm.get('modeOfPayment')?.value,
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
            bookingDate: new Date(booking.bookingDate),
            travelStartDate: new Date(booking.travelStartDate),
            travelEndDate: new Date(booking.travelEndDate),
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

  addNewPriceBreakdownRow(): void {
    // If already editing, save current changes first
    if (this.editingPriceBreakdownIndex !== null) {
      this.toastService.warn('Warning', 'Please save or cancel your current edits first');
      return;
    }

    // Create a new empty price breakdown item
    const newItem: PriceBreakdown = {
      label: '',
      vendorName: '',
      amount: 0,
      quantity: 1,
      serviceFeePct: 0,
      serviceFee: 0,
      netAmount: 0,
      total: 0
    };

    // Add to the array
    this.localPriceBreakdown.push(newItem);

    // Start editing the new item
    this.startEditingPriceBreakdown(this.localPriceBreakdown.length - 1);
  }

  // Add method to start editing a price breakdown item
  startEditingPriceBreakdown(index: number): void {
    this.editingPriceBreakdownIndex = index;
    const item = this.localPriceBreakdown[index];

    // Create a new form with the item's values
    this.priceBreakdownForm = this.buildPriceBreakdownForm();

    // Determine if percentage was used based on serviceFeePct value
    const usePercentage = (item.serviceFeePct || 0) > 0;

    // Calculate service fee per pax
    const serviceFeePerPax = usePercentage
      ? ((item.amount * (item.serviceFeePct || 0)) / 100)
      : ((item.serviceFee || 0) / item.quantity);

    this.priceBreakdownForm.patchValue({
      label: item.label,
      vendorName: item.vendorName || '',
      amount: item.amount,
      quantity: item.quantity,
      usePercentage: usePercentage,
      serviceFeePct: item.serviceFeePct || 0,
      serviceFeePerPax: serviceFeePerPax,
      serviceFee: item.serviceFee || 0,
      total: item.total,
      netAmount: item.netAmount || 0
    });
  }

  // Add method to cancel editing
  cancelEditingPriceBreakdown(): void {
    // If this was a new item (empty), remove it
    if (this.editingPriceBreakdownIndex !== null) {
      const item = this.localPriceBreakdown[this.editingPriceBreakdownIndex];
      if (item.label === '' && item.amount === 0) {
        this.localPriceBreakdown.splice(this.editingPriceBreakdownIndex, 1);
      }
    }

    // Reset editing state
    this.editingPriceBreakdownIndex = null;
  }

  savePriceBreakdown(): void {
    if (this.priceBreakdownForm.invalid) {
      this.toastService.warn('Validation Error', 'Please fill in all required fields correctly');
      return;
    }

    if (this.editingPriceBreakdownIndex === null) {
      this.toastService.warn('Error', 'No item selected for editing');
      return;
    }

    const form = this.priceBreakdownForm;
    const usePercentage = form.get('usePercentage')?.value || false;
    const quantity = form.get('quantity')?.value || 1;

    // Calculate final values
    const amount = form.get('amount')?.value || 0;
    const serviceFeePct = usePercentage ? (form.get('serviceFeePct')?.value || 0) : 0;
    const serviceFeePerPax = usePercentage
      ? ((amount * serviceFeePct) / 100)
      : (form.get('serviceFeePerPax')?.value || 0);
    const serviceFee = serviceFeePerPax * quantity;
    const total = amount * quantity;
    const netAmount = total - serviceFee;

    // Update the item in the array
    this.localPriceBreakdown[this.editingPriceBreakdownIndex] = {
      label: form.get('label')?.value || '',
      vendorName: form.get('vendorName')?.value || '',
      amount,
      quantity,
      serviceFeePct,
      serviceFeePerPax,
      serviceFee,
      netAmount,
      total
    };

    // Reset editing state
    this.editingPriceBreakdownIndex = null;

    this.calculateTotals();
    this.hasUnsavedChanges = true;
    this.toastService.info('Info', 'Price breakdown saved. Remember to save your changes.');
  }

  deletePriceBreakdown(index: number): void {
    // If currently editing, cancel first
    if (this.editingPriceBreakdownIndex !== null) {
      this.cancelEditingPriceBreakdown();
    }

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

  resetPaymentForm(): void {
    this.isEditingPayment = false;
    this.editingPaymentIndex = null;
    this.paymentForm.reset();
    this.paymentForm.patchValue({
      date: new Date(),
      paymentMethod: this.bookingForm.get('modeOfPayment')?.value ?? 'CASH',
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

    const amount = this.paymentForm.get('amount')?.value || 0;
    const remainingAmount = this.calculateRemainingAmount();

    // Automatically determine payment type based on amount
    const paymentType = amount >= remainingAmount ? 'FULL_PAYMENT' : 'PARTIAL_PAYMENT';

    const payment: PaymentHistory = {
      id: null,
      date: this.formatDate(this.paymentForm.get('date')?.value),
      amount: amount,
      paymentMethod: this.paymentForm.get('paymentMethod')?.value || 'CASH',
      paymentType: paymentType,
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

  generateStatementOfAccount(): void {
    if (!this.bookingId) return;

    if (this.bookingForm.invalid) {
      this.toastService.warn('Validation Error', 'Please fill in all required fields correctly');
      return;
    }

    if (this.hasUnsavedChanges) {
      this.toastService.warn('Unsaved Changes', 'You have unsaved changes. Please save first before generating the statement of account');
    }

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

  generatePaymentAcknowledgement(paymentHistoryId: string): void {
    if (!this.bookingId) return;

    if (this.bookingForm.invalid) {
      this.toastService.warn('Validation Error', 'Please fill in all required fields correctly');
      return;
    }

    this.loading = true;
    this.bookingService.generatePaymentAcknowledgement(this.bookingId, paymentHistoryId)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response) => {
          if (response?.status !== 200 || !response.body || response.body.size === 0) {
            this.toastService.warn('Warning', 'No data found for Statement of Account');
            return;
          }

          const fileName = response.headers.get('Content-Disposition')?.split(';')[1]?.split('=')[1];

          this.toastService.success('Success', 'Payment Acknowledgement generated successfully');
          const fileURL = URL.createObjectURL(response.body);
          const a = document.createElement('a');
          a.href = fileURL;
          a.target = '_blank';
          a.download = fileName ?? 'payment-acknowledgement.pdf';
          document.body.appendChild(a); // Required for Firefox
          a.click();
          document.body.removeChild(a); // Clean up
          URL.revokeObjectURL(fileURL); // Release the object URL
        },
        error: (error) => {
          this.toastService.error('Error', 'Failed to generate Payment Acknowledgement');
          console.error('Error generating Payment Acknowledgement:', error);
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
    return this.paymentMethods.find(paymentMethod => paymentMethod.value == value)?.label ?? '';
  }

  getPaymentTypeLabel(value: string): string {
    return this.paymentTypes.find(paymentType => paymentType.value == value)?.label ?? '';
  }

  calculateTotalServiceFees(): number {
    return this.localPriceBreakdown.reduce((total, item) => {
      return total + (item.serviceFee || 0);
    }, 0);
  }

  calculateTotalNetAmount(): number {
    return this.localPriceBreakdown.reduce((total, item) => {
      return total + (item.netAmount || 0);
    }, 0);
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
      salutation: this.fb.control<string>('', Validators.required),
      bookingDate: this.fb.control<Date>(new Date(), Validators.required),
      travelStartDate: this.fb.control<Date>({value: new Date(), disabled: true}, Validators.required),
      travelEndDate: this.fb.control<Date>({value: new Date(), disabled: true}, Validators.required),
      destination: this.fb.control<string>({value: '', disabled: true}, Validators.required),
      modeOfPayment: this.fb.control<string>('CASH', Validators.required),
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
      paymentMethod: this.fb.control<string>(this.bookingForm.get('modeOfPayment')?.value ?? 'CASH', Validators.required),
      remarks: this.fb.control<string>('')
    });
  }

  private buildPriceBreakdownForm() {
    const form = this.fb.group({
      label: this.fb.control<string>('', Validators.required),
      vendorName: this.fb.control<string>('', Validators.required),
      amount: this.fb.control<number>(0, [Validators.required, Validators.min(1)]),
      quantity: this.fb.control<number>(1, [Validators.required, Validators.min(1)]),
      usePercentage: this.fb.control<boolean>(true),
      serviceFeePct: this.fb.control<number>(0, [Validators.required, Validators.min(0), Validators.max(100)]),
      serviceFeePerPax: this.fb.control<number>(0, [Validators.required, Validators.min(0)]),
      serviceFee: this.fb.control<number>({value: 0, disabled: true}),
      netAmount: this.fb.control<number>({value: 0, disabled: true}),
      total: this.fb.control<number>({value: 0, disabled: true})
    });

    // Set initial state of serviceFeePerPax based on usePercentage
    if (form.get('usePercentage')?.value) {
      form.get('serviceFeePerPax')?.disable();
    }

    // Subscribe to usePercentage changes
    form.get('usePercentage')?.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(usePercentage => {
        const serviceFeePerPaxControl = form.get('serviceFeePerPax');
        if (usePercentage) {
          serviceFeePerPaxControl?.disable({emitEvent: false});
        } else {
          serviceFeePerPaxControl?.enable({emitEvent: false});
        }
        this.updatePriceCalculations(form);
      });

    // Subscribe to other relevant form control changes
    const relevantControls = ['amount', 'quantity', 'serviceFeePct', 'serviceFeePerPax'];
    relevantControls.forEach(controlName => {
      form.get(controlName)?.valueChanges
        .pipe(
          untilDestroyed(this),
          distinctUntilChanged()
        )
        .subscribe(() => this.updatePriceCalculations(form));
    });

    return form;
  }

  private updatePriceCalculations(form: any): void {
    const amount = form.get('amount')?.value || 0;
    const quantity = form.get('quantity')?.value || 1;
    const usePercentage = form.get('usePercentage')?.value;
    const serviceFeePct = form.get('serviceFeePct')?.value || 0;
    const serviceFeePerPax = form.get('serviceFeePerPax')?.value || 0;

    // Calculate total amount (rate per pax * quantity)
    const total = amount * quantity;

    // Calculate service fee
    let serviceFee: number;
    let updatedServiceFeePerPax = serviceFeePerPax;

    if (usePercentage) {
      // When using percentage, calculate service fee based on percentage
      updatedServiceFeePerPax = (amount * serviceFeePct) / 100;
      serviceFee = updatedServiceFeePerPax * quantity;
    } else {
      // When using manual entry, use the entered per pax fee
      serviceFee = serviceFeePerPax * quantity;
    }

    // Calculate net amount
    const netAmount = Math.max(0, total - serviceFee);

    // Update form values without triggering additional change events
    form.patchValue({
      total,
      serviceFee,
      serviceFeePerPax: usePercentage ? updatedServiceFeePerPax : serviceFeePerPax,
      netAmount
    }, {emitEvent: false});
  }
}
