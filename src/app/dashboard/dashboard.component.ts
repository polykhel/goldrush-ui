import { DatePipe, DecimalPipe, NgOptimizedImage } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Dashboard } from '@models/dashboard.model';
import { Provider } from '@models/provider.model';
import { DashboardService } from '@services/dashboard.service';
import { ExchangeRateService } from '@services/exchange-rate.service';
import { ProviderService } from '@services/provider.service';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [
    ButtonModule,
    TableModule,
    RouterLink,
    NgOptimizedImage,
    DatePipe,
    DecimalPipe,
    FormsModule,
    InputNumberModule,
    DropdownModule,
  ],
})
export class DashboardComponent implements OnInit {
  dashboard: Dashboard | null = null;
  providers: Provider[] = [];

  // Currency converter properties
  amount: number = 0;
  fromCurrency: string = 'USD';
  convertedAmount: number = 0;

  currencies = [
    { label: 'US Dollar', value: 'USD', symbol: '$' },
    { label: 'Euro', value: 'EUR', symbol: '€' },
    { label: 'British Pound', value: 'GBP', symbol: '£' },
    { label: 'Singapore Dollar', value: 'SGD', symbol: 'S$' },
    { label: 'Hong Kong Dollar', value: 'HKD', symbol: 'HK$' },
    { label: 'Japanese Yen', value: 'JPY', symbol: '¥' },
  ];

  constructor(
    private dashboardService: DashboardService,
    private providerService: ProviderService,
    private exchangeRateService: ExchangeRateService,
  ) {}

  ngOnInit(): void {
    this.dashboardService.getDashboard().subscribe((dashboard) => {
      this.dashboard = dashboard;
      this.fetchExchangeRates();
    });

    this.providerService.getProviders().subscribe((providers) => {
      this.providers = providers;
    });
  }

  convertCurrency(): void {
    if (!this.dashboard?.exchangeRates) return;

    const rate = this.getExchangeRate(this.fromCurrency);
    if (rate) {
      this.convertedAmount = this.amount * rate;
    }
  }

  private fetchExchangeRates(): void {
    forkJoin({
      usd: this.exchangeRateService.getExchangeRate('USD'),
      eur: this.exchangeRateService.getExchangeRate('EUR'),
      gbp: this.exchangeRateService.getExchangeRate('GBP'),
      sgd: this.exchangeRateService.getExchangeRate('SGD'),
      hkd: this.exchangeRateService.getExchangeRate('HKD'),
      jpy: this.exchangeRateService.getExchangeRate('JPY'),
    }).subscribe((rates) => {
      if (this.dashboard) {
        this.dashboard.exchangeRates = {
          usdToPhp: rates.usd,
          eurToPhp: rates.eur,
          gbpToPhp: rates.gbp,
          sgdToPhp: rates.sgd,
          hkdToPhp: rates.hkd,
          jpyToPhp: rates.jpy,
          lastUpdated: new Date(),
        };
      }
    });
  }

  private getExchangeRate(currency: string): number | null {
    if (!this.dashboard?.exchangeRates) return null;

    switch (currency) {
      case 'USD':
        return this.dashboard.exchangeRates.usdToPhp;
      case 'EUR':
        return this.dashboard.exchangeRates.eurToPhp;
      case 'GBP':
        return this.dashboard.exchangeRates.gbpToPhp;
      case 'SGD':
        return this.dashboard.exchangeRates.sgdToPhp;
      case 'HKD':
        return this.dashboard.exchangeRates.hkdToPhp;
      case 'JPY':
        return this.dashboard.exchangeRates.jpyToPhp;
      default:
        return null;
    }
  }
}
