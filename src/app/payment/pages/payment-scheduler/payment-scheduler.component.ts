import { NgClass, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '@services/toast.service';
import { SumPipe } from '@shared/pipes/sum.pipe';
import dayjs from 'dayjs';
import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { FloatLabel } from 'primeng/floatlabel';
import { Fluid } from 'primeng/fluid';
import { InputNumber } from 'primeng/inputnumber';
import { Panel } from 'primeng/panel';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { Toast } from 'primeng/toast';

interface Schedule {
  date: string;
  amount: string;
  charge?: string;
  total?: string;
}

@Component({
  selector: 'app-payment-scheduler',
  standalone: true,
  imports: [
    Button,
    DatePicker,
    FloatLabel,
    Fluid,
    InputNumber,
    NgIf,
    ReactiveFormsModule,
    TableModule,
    Select,
    Panel,
    Toast,
    NgClass,
    SumPipe,
  ],
  templateUrl: './payment-scheduler.component.html',
})
export class PaymentSchedulerComponent {
  minDate: Date = dayjs().add(45, 'day').toDate();
  today: Date = new Date();
  schedule: Schedule[] = [];
  paymentMethods = [
    { label: 'Cash', value: 'cash' },
    { label: 'Bank/Card', value: 'bank' },
  ];
  private formBuilder = inject(FormBuilder);
  form = this.formBuilder.group({
    startDate: this.formBuilder.control<Date | null>(new Date(), [
      Validators.required,
    ]),
    travelDate: this.formBuilder.control<Date | null>(null, [
      Validators.required,
    ]),
    totalAmount: this.formBuilder.control<number | null>(null, [
      Validators.required,
    ]),
    downPayment: this.formBuilder.control<number | null>(null),
    lastPaymentDate: this.formBuilder.control<Date | null>({
      value: null,
      disabled: true,
    }),
    paymentMethod: this.formBuilder.control('cash', [Validators.required]),
    downPaymentPercentage: this.formBuilder.control(20, [
      Validators.required,
      Validators.min(20),
      Validators.max(100),
    ]),
    monthlyStartDate: this.formBuilder.control<Date | null>(null),
    monthlyChargePercentage: this.formBuilder.control(5, [
      Validators.required,
      Validators.min(0),
      Validators.max(100),
    ]),
  });
  private toastService = inject(ToastService);
  private readonly dateFormat = 'MMM D, YYYY';

  generateSchedule(): void {
    if (!this.validateForm()) {
      return;
    }

    try {
      const formData = this.getFormData();
      if (!this.validateFormData(formData)) {
        return;
      }

      // Reset schedule
      this.schedule = [];

      // Calculate payment schedule
      this.calculatePaymentSchedule(formData);

      // Update form with calculated values
      this.updateFormWithCalculatedValues(formData);

      this.toastService.success(
        'Schedule Generated',
        'Created ' + this.schedule.length + ' payment(s)',
      );
    } catch (error) {
      this.toastService.defaultError('Failed to generate payment schedule');
    }
  }

  private validateForm(): boolean {
    if (!this.form.valid) {
      this.toastService.warn(
        'Validation Error',
        'Please fill in all required fields correctly',
      );
      return false;
    }
    return true;
  }

  private getFormData() {
    const value = this.form.getRawValue();
    const totalAmount = value.totalAmount ?? 0;
    const startDate = dayjs(value.startDate);
    const travelDate = dayjs(value.travelDate);
    const lastPaymentDate = travelDate.subtract(45, 'day');
    const downPaymentPercent = value.downPaymentPercentage ?? 20;
    const isBank = value.paymentMethod === 'bank';
    const monthlyChargePercent = isBank
      ? (value.monthlyChargePercentage ?? 5)
      : 0;
    const downPayment = totalAmount * (downPaymentPercent / 100);
    let remainingAmount = totalAmount - downPayment;

    // Add monthly charge if using bank/card payment
    if (isBank) {
      remainingAmount *= 1 + monthlyChargePercent / 100;
    }

    const monthlyStartDate = value.monthlyStartDate
      ? dayjs(value.monthlyStartDate)
      : startDate.add(30, 'day');

    // Validate monthly start date is not after last payment date
    const validMonthlyStartDate = monthlyStartDate.isAfter(lastPaymentDate)
      ? startDate.add(30, 'day')
      : monthlyStartDate;

    return {
      value,
      totalAmount,
      startDate,
      travelDate,
      lastPaymentDate,
      downPaymentPercent,
      isBank,
      monthlyChargePercent,
      downPayment,
      remainingAmount,
      validMonthlyStartDate,
    };
  }

  private validateFormData(formData: any): boolean {
    return !(
      !formData.totalAmount ||
      !formData.value.startDate ||
      !formData.value.travelDate
    );
  }

  private calculatePaymentSchedule(formData: any): void {
    const { startDate, lastPaymentDate } = formData;

    // Handle cases where startDate is on or after lastPaymentDate (one immediate payment)
    if (this.isImmediatePaymentRequired(startDate, lastPaymentDate)) {
      this.createImmediatePaymentSchedule(formData);
      return;
    }

    // Add down payment to schedule
    this.addDownPaymentToSchedule(formData);

    // Calculate and add remaining payments
    this.addRemainingPaymentsToSchedule(formData);
  }

  private isImmediatePaymentRequired(
    startDate: dayjs.Dayjs,
    lastPaymentDate: dayjs.Dayjs,
  ): boolean {
    return (
      startDate.isSame(lastPaymentDate) || startDate.isAfter(lastPaymentDate)
    );
  }

  private createImmediatePaymentSchedule(formData: any): void {
    const { startDate, totalAmount, isBank, monthlyChargePercent } = formData;
    const charge = isBank ? (totalAmount * monthlyChargePercent) / 100 : 0;

    this.schedule = [
      {
        date: startDate.format(this.dateFormat),
        amount: totalAmount.toFixed(2),
        charge: charge.toFixed(2),
        total: (totalAmount + charge).toFixed(2),
      },
    ];
  }

  private addDownPaymentToSchedule(formData: any): void {
    const { startDate, downPayment } = formData;

    this.schedule.push({
      date: startDate.format(this.dateFormat),
      amount: downPayment.toFixed(2),
      charge: '0.00',
      total: downPayment.toFixed(2),
    });
  }

  private addRemainingPaymentsToSchedule(formData: any): void {
    const { validMonthlyStartDate, lastPaymentDate, remainingAmount } =
      formData;

    const paymentDates = this.calculatePaymentDates(
      validMonthlyStartDate,
      lastPaymentDate,
    );

    if (remainingAmount > 0) {
      if (paymentDates.length === 0) {
        this.addFinalPayment(formData);
      } else {
        this.addMonthlyPayments(formData, paymentDates);
      }
    }
  }

  private calculatePaymentDates(
    validMonthlyStartDate: dayjs.Dayjs,
    lastPaymentDate: dayjs.Dayjs,
  ): dayjs.Dayjs[] {
    const paymentDates: dayjs.Dayjs[] = [];

    // Check if lastPaymentDate is AT LEAST 30 days after monthly start date
    if (lastPaymentDate.diff(validMonthlyStartDate, 'day') >= 30) {
      let currentPaymentDate = validMonthlyStartDate;

      while (
        currentPaymentDate.isBefore(lastPaymentDate) ||
        currentPaymentDate.isSame(lastPaymentDate)
      ) {
        paymentDates.push(currentPaymentDate);
        currentPaymentDate = currentPaymentDate.add(30, 'day');
      }
    }

    return paymentDates;
  }

  private addFinalPayment(formData: any): void {
    const {
      lastPaymentDate,
      totalAmount,
      downPayment,
      isBank,
      monthlyChargePercent,
    } = formData;

    const baseAmount = totalAmount - downPayment;
    const charge = isBank ? (baseAmount * monthlyChargePercent) / 100 : 0;

    this.schedule.push({
      date: lastPaymentDate.format(this.dateFormat),
      amount: baseAmount.toFixed(2),
      charge: charge.toFixed(2),
      total: (baseAmount + charge).toFixed(2),
    });
  }

  private addMonthlyPayments(formData: any, paymentDates: dayjs.Dayjs[]): void {
    const { totalAmount, downPayment, isBank, monthlyChargePercent } = formData;

    const baseAmountPerPayment =
      (totalAmount - downPayment) / paymentDates.length;
    const chargePerPayment = isBank
      ? (baseAmountPerPayment * monthlyChargePercent) / 100
      : 0;

    this.schedule.push(
      ...paymentDates.map((date) => ({
        date: date.format(this.dateFormat),
        amount: baseAmountPerPayment.toFixed(2),
        charge: chargePerPayment.toFixed(2),
        total: (baseAmountPerPayment + chargePerPayment).toFixed(2),
      })),
    );
  }

  private updateFormWithCalculatedValues(formData: any): void {
    this.form.patchValue({
      downPayment: formData.downPayment,
      lastPaymentDate: formData.lastPaymentDate.toDate(),
    });
  }

  clear(): void {
    this.form.reset({
      paymentMethod: 'cash',
      downPaymentPercentage: 20,
      monthlyChargePercentage: 5,
      startDate: new Date(),
      monthlyStartDate: new Date(),
    });
    this.schedule = [];
  }

  getFieldError(fieldName: string): string | null {
    const control = this.form.get(fieldName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return 'This field is required';
      }
      if (control.errors['min']) {
        return `Minimum value is ${control.errors['min'].min}`;
      }
      if (control.errors['max']) {
        return `Maximum value is ${control.errors['max'].max}`;
      }
    }
    return null;
  }
}
