import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { formatDateRange } from '@core/utils/date.util';
import { Quotation } from '@models/quotation.model';
import dayjs from 'dayjs';

@Component({
  selector: 'app-quotation-preview',
  imports: [CommonModule],
  templateUrl: './quotation-preview.component.html',
})
export class QuotationPreviewComponent {

  @Input() quotation?: Quotation | null;

  today = dayjs().format('MMM DD, YYYY');

  formatTravelDates(travelDates?: Date[] | null): string {
    return formatDateRange(travelDates);
  }
}
