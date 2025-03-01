import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { formatDateRange } from '@utils/date.util';
import dayjs from 'dayjs';

import { DateRange } from '@models/date-range.model';
import { ClientQuotation, Flight } from '@models/quotation.model';
import { formatPairedValues, formatValue } from '@utils/string.util';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { NgxPrintService, PrintOptions } from 'ngx-print';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-quotation-preview',
  standalone: true,
  imports: [CommonModule, Dialog, Button],
  templateUrl: './quotation-preview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuotationPreviewComponent {
  @Input() visible = false;
  @Input({ required: true }) quotation!: ClientQuotation;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() cancel = new EventEmitter<void>();

  today = dayjs().format('MMM DD, YYYY');

  constructor(private printService: NgxPrintService) {}

  formatTravelDates(travelDates?: DateRange | null): string {
    return formatDateRange(travelDates);
  }

  getAirline() {
    const departureAirline = this.quotation?.flightDetails?.departure?.airline;
    const arrivalAirline = this.quotation?.flightDetails?.arrival?.airline;
    return departureAirline === arrivalAirline
      ? departureAirline
      : [departureAirline, arrivalAirline].filter(Boolean).join(', ');
  }

  getFlightDetails(flightDetail?: Flight | null, nextCode?: string | null) {
    if (!flightDetail) {
      return '';
    }

    const startDate = dayjs(flightDetail.startDate);
    const endDate = dayjs(flightDetail.endDate);
    const route = formatPairedValues(flightDetail.airportCode, nextCode);
    const dateRange = formatPairedValues(
      startDate.format('MM/DD/YY'),
      endDate.format('MM/DD/YY'),
    );
    const timeRange = formatPairedValues(
      startDate.format('HH:mm'),
      endDate.format('HH:mm'),
    );

    return [formatValue(flightDetail.flightNumber), route, dateRange, timeRange]
      .filter(Boolean)
      .join(' ');
  }

  onCancel() {
    this.cancel.emit();
    this.visible = false;
    this.visibleChange.emit(false);
  }

  generateDoc(type: string) {
    const element = document.getElementById('preview');
    if (element) {
      if (type === 'img') {
        html2canvas(element, {
          allowTaint: true,
          useCORS: true,
        }).then((canvas) => {
          const imgData = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = imgData;
          link.download = this.quotation?.title + '.png';
          link.click();
        });
      } else if (type === 'pdf') {
        const printOptions = new PrintOptions({
          printSectionId: 'preview',
          useExistingCss: true,
        });
        this.printService.print(printOptions);
      }
    }
  }
}
