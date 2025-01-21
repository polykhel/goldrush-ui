import { NgIf } from '@angular/common';
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
import { TableModule } from 'primeng/table';
import { Schedule } from '@models/schedule.model';

@Component({
  selector: 'app-payment-scheduler',
  imports: [
    Button,
    Card,
    DatePicker,
    Divider,
    FloatLabel,
    Fluid,
    InputNumber,
    NgIf,
    ReactiveFormsModule,
    TableModule,
  ],
  templateUrl: './payment-scheduler.component.html',
  styleUrl: './payment-scheduler.component.css'
})
export class PaymentSchedulerComponent {
  minDate: Date = dayjs().add(45, 'day').toDate();
  today: Date = new Date();
  schedule: Schedule[] = [];

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
  });
  private readonly dateFormat = 'MMM D, YYYY';

  generateSchedule(): void {
    if (this.form.valid) {
      const value = this.form.value;
      const totalAmount = value.totalAmount!;
      const startDate = dayjs(value.startDate);
      const lastPaymentDate = dayjs(value.travelDate).subtract(45, 'day'); // 45 days before travel

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
          downPayment: totalAmount,
          lastPaymentDate: lastPaymentDate.toDate(),
        });
        return; // Exit early as only one payment is needed
      }

      const downPayment = value.downPayment ?? totalAmount * 0.2;
      const remainingAmount = totalAmount - downPayment;

      this.schedule = [
        {
          date: startDate.format(this.dateFormat),
          amount: downPayment.toFixed(2),
        },
      ];

      const paymentDates = [];
      let currentPaymentDate = startDate.add(30, 'day'); // Start 30 days after start date

      // Check if lastPaymentDate is AT LEAST 30 days after start date
      if (lastPaymentDate.diff(startDate, 'day') >= 30) {
        while (
          currentPaymentDate.isBefore(lastPaymentDate) ||
          currentPaymentDate.isSame(lastPaymentDate)
        ) {
          paymentDates.push(currentPaymentDate);
          currentPaymentDate = currentPaymentDate.add(30, 'day');
        }
      }

      // Handle case where there is only a down payment and a final payment
      if (paymentDates.length === 0 && remainingAmount > 0) {
        this.schedule.push({
          date: lastPaymentDate.format(this.dateFormat),
          amount: remainingAmount.toFixed(2),
        });
      } else {
        // Handle case where there are monthly payments
        const amountPerPayment = remainingAmount / paymentDates.length;
        this.schedule.push(
          ...paymentDates.map((date) => ({
            date: date.format(this.dateFormat),
            amount: amountPerPayment.toFixed(2),
          })),
        );
      }

      this.form.patchValue({
        downPayment,
        lastPaymentDate: lastPaymentDate.toDate(),
      });
    }
  }

  clear(): void {
    this.form.reset();
    this.schedule = [];
  }
}
