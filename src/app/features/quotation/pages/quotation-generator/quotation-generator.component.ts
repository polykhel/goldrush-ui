import { Component } from '@angular/core';
import { Quotation } from '@models/quotation.model';
import html2canvas from 'html2canvas';
import { NgxPrintModule, NgxPrintService, PrintOptions } from 'ngx-print';
import { Button } from 'primeng/button';
import { QuotationFormComponent } from '../../components/quotation-form/quotation-form.component';
import { QuotationPreviewComponent } from '../../components/quotation-preview/quotation-preview.component';

@Component({
  selector: 'app-quotation-generator',
  imports: [
    QuotationPreviewComponent,
    QuotationFormComponent,
    NgxPrintModule,
    Button,
  ],
  templateUrl: './quotation-generator.component.html',
})
export class QuotationGeneratorComponent {
  quotation: Quotation | null = null;

  constructor(private printService: NgxPrintService) {
  }

  updatePreview(formValue: Quotation) {
    this.quotation = formValue;
  }

  generateDoc(type: string) {
    const element = document.getElementById('preview');
    if (element) {
      if (type === 'img') {
        html2canvas(element, {
          allowTaint: true,
          useCORS: true
        }).then(
          (canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = imgData;
            link.download = this.quotation?.title + '.png';
            link.click();
          },
        );
      } else if (type === 'pdf') {
        const printOptions = new PrintOptions({
          printSectionId: 'preview',
          useExistingCss: true
        });
        this.printService.print(printOptions);
      }
    }
  }
}
