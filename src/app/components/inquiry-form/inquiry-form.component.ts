import { NgForOf, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormArray,
  FormBuilder, FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { DatePicker } from 'primeng/datepicker';
import { FloatLabel } from 'primeng/floatlabel';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { RadioButton } from 'primeng/radiobutton';
import { Textarea } from 'primeng/textarea';

@Component({
  selector: 'app-inquiry-form',
  imports: [
    ReactiveFormsModule,
    Checkbox,
    RadioButton,
    DatePicker,
    FloatLabel,
    InputText,
    InputNumber,
    NgForOf,
    Button,
    NgIf,
    InputGroup,
    InputGroupAddon,
    Textarea,
  ],
  templateUrl: './inquiry-form.component.html',
  styleUrl: './inquiry-form.component.css',
})
export class InquiryFormComponent {
  inquiryForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.inquiryForm = this.fb.group({
      clientName: [''],
      date: [''],
      contactPointFB: [false],
      contactPointPM: [false],
      contactPointOther: [''],
      travelDays: [null],
      travelNights: [null],
      destination: [null],
      dateRanges: this.fb.array([]),
      paxAdult: [''],
      paxChildAges: [''],
      packageType: [null],
      otherServices: [''],
      priceChecklistUosTracker: [false],
      priceChecklistBkPackage: [false],
      priceChecklistViaMarketing: [false],
      emailQuotationUosGmail: [false],
      emailQuotationBkGmail: [false],
      emailQuotationViaEmailUs: [false],
      remarks: [''],
      quotationSubmitted: [''], // Use string for radio button values
      roe: [''],
      tp: [''],
    });
    this.addDateRange();
  }

  get dateRanges(): FormArray {
    return this.inquiryForm.get('dateRanges') as FormArray;
  }

  onSubmit() {
    if (this.inquiryForm.valid) {
      console.log(this.inquiryForm.value);
      // Here you would typically send the data to a service
    } else {
      // Handle form validation errors
      console.log('Form is invalid');
    }
  }

  newDateRange(): FormGroup {
    return this.fb.group({
      dates: new FormControl([]),
    });
  }

  addDateRange() {
    this.dateRanges.push(this.newDateRange());
  }

  removeDateRange(index: number) {
    this.dateRanges.removeAt(index);
  }
}
