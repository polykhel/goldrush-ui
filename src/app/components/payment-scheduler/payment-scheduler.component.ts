import { NgClass, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import dayjs from 'dayjs';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { DatePicker } from 'primeng/datepicker';
import { Divider } from 'primeng/divider';
import { FloatLabel } from 'primeng/floatlabel';
import { Fluid } from 'primeng/fluid';
import { InputNumber } from 'primeng/inputnumber';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { Schedule } from '@models/schedule.model';
import { Dropdown } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';
import { Panel } from 'primeng/panel';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-payment-scheduler',
  imports: [
    Button,
    Card,
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
  ],
  templateUrl: './payment-scheduler.component.html',
  providers: [MessageService],
})
export class PaymentSchedulerComponent {
  minDate: Date = dayjs().add(45, 'day').toDate();
  today: Date = new Date();
  schedule: Schedule[] = [];

  private formBuilder = inject(FormBuilder);
  private messageService = inject(MessageService);

  paymentMethods = [
    { label: 'Cash', value: 'cash' },
    { label: 'Bank/Card', value: 'bank' },
  ];

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
    monthlyStartDate: this.formBuilder.control<Date | null>(new Date()),
    monthlyChargePercentage: this.formBuilder.control(5, [
      Validators.required,
      Validators.min(0),
      Validators.max(100),
    ]),
  });
  private readonly dateFormat = 'MMM D, YYYY';

  generateSchedule(): void {
    if (!this.form.valid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields correctly',
      });
      return;
    }

    try {
      const value = this.form.getRawValue(); // Use getRawValue to include disabled controls
      const totalAmount = value.totalAmount ?? 0;
      const startDate = dayjs(value.startDate);
      const travelDate = dayjs(value.travelDate);

      if (!totalAmount || !value.startDate || !value.travelDate) {
        return;
      }

      const lastPaymentDate = travelDate.subtract(45, 'day');
      const downPaymentPercent = value.downPaymentPercentage || 20;
      const isBank = value.paymentMethod === 'bank';
      const monthlyChargePercent = isBank
        ? value.monthlyChargePercentage ?? 5
        : 0;

      // Calculate down payment based on percentage
      const downPayment = totalAmount * (downPaymentPercent / 100);
      let remainingAmount = totalAmount - downPayment;

      // Add monthly charge if using bank/card payment
      if (isBank) {
        remainingAmount *= 1 + monthlyChargePercent / 100;
      }

      // Reset schedule
      this.schedule = [];

      // Handle cases where startDate is on or after lastPaymentDate (one immediate payment)
      if (
        startDate.isSame(lastPaymentDate) ||
        startDate.isAfter(lastPaymentDate)
      ) {
        this.schedule = [
          {
            date: startDate.format(this.dateFormat),
            amount: totalAmount.toFixed(2),
          },
        ];
        this.form.patchValue({
          downPayment,
          lastPaymentDate: lastPaymentDate.toDate(),
        });
        return;
      }

      // Add down payment to schedule
      this.schedule.push({
        date: startDate.format(this.dateFormat),
        amount: downPayment.toFixed(2),
      });

      const monthlyStartDate = value.monthlyStartDate
        ? dayjs(value.monthlyStartDate)
        : startDate.add(30, 'day');

      // Validate monthly start date is not after last payment date
      const validMonthlyStartDate = monthlyStartDate.isAfter(lastPaymentDate)
        ? startDate.add(30, 'day')
        : monthlyStartDate;

      const paymentDates: dayjs.Dayjs[] = [];
      let currentPaymentDate = validMonthlyStartDate;

      // Check if lastPaymentDate is AT LEAST 30 days after monthly start date
      if (lastPaymentDate.diff(validMonthlyStartDate, 'day') >= 30) {
        while (
          currentPaymentDate.isBefore(lastPaymentDate) ||
          currentPaymentDate.isSame(lastPaymentDate)
        ) {
          paymentDates.push(currentPaymentDate);
          currentPaymentDate = currentPaymentDate.add(30, 'day');
        }
      }

      // Handle remaining payments
      if (remainingAmount > 0) {
        if (paymentDates.length === 0) {
          // If no monthly payments possible, add final payment
          this.schedule.push({
            date: lastPaymentDate.format(this.dateFormat),
            amount: remainingAmount.toFixed(2),
          });
        } else {
          // Add monthly payments
          const amountPerPayment = remainingAmount / paymentDates.length;
          this.schedule.push(
            ...paymentDates.map((date) => ({
              date: date.format(this.dateFormat),
              amount: amountPerPayment.toFixed(2),
            })),
          );
        }
      }

      this.form.patchValue({
        downPayment,
        lastPaymentDate: lastPaymentDate.toDate(),
      });

      this.messageService.add({
        severity: 'success',
        summary: 'Schedule Generated',
        detail: `Created ${this.schedule.length} payment(s)`,
      });
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to generate payment schedule',
      });
    }
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
