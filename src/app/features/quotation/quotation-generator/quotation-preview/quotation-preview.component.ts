import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { formatDateRange } from '@utils/date.util';
import { Quotation } from '@models/quotation.model';
import dayjs from 'dayjs';
import { DateRange } from '@models/inquiry.model';

@Component({
  selector: 'app-quotation-preview',
  imports: [CommonModule],
  templateUrl: './quotation-preview.component.html',
})
export class QuotationPreviewComponent {

  @Input() quotation?: Quotation | null;

  today = dayjs().format('MMM DD, YYYY');

  formatTravelDates(travelDates?: DateRange | null): string {
    return formatDateRange(travelDates);
  }
}
