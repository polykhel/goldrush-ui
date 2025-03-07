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
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
      // Common html2canvas options for both image and PDF
      const canvasOptions = {
        allowTaint: true,
        useCORS: true,
        scale: 2,
        logging: false,
        backgroundColor: '#ffffff'
      };

      if (type === 'img') {
       this.generateImage(element, canvasOptions);
      } else if (type === 'pdf') {
        this.generatePDF(element, canvasOptions);
      }
    }
  }

  generateImage(element: HTMLElement, canvasOptions: any) {
    html2canvas(element, canvasOptions).then((canvas) => {
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `${this.quotation.clientName}_${this.quotation?.title}.png`;
      link.click();
    });
  }

  generatePDF(element: HTMLElement, canvasOptions: any) {
    html2canvas(element, canvasOptions).then(canvas => {
      const imgData = canvas.toDataURL('image/jpeg', 1.0);

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF('p', 'mm', 'a4');
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);

      const pdfHeight = pdf.internal.pageSize.getHeight();
      if (imgHeight > pdfHeight) {
        let heightLeft = imgHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;
        }
      }

      const fileName = `${this.quotation.clientName}_${this.quotation?.title}.pdf`;
      pdf.save(fileName);
    });
  }
}
