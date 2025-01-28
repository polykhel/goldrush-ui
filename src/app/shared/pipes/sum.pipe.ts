import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sum',
  standalone: true
})
export class SumPipe implements PipeTransform {
  transform(items: any[], prop: string): string {
    if (!items || !prop) return '0.00';
    
    const sum = items
      .map(item => parseFloat(item[prop]))
      .reduce((a, b) => a + b, 0);
      
    return sum.toFixed(2);
  }
} 