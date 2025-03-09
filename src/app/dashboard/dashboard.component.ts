import { NgOptimizedImage } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Provider } from '@models/provider.model';
import { ProviderService } from '@services/provider.service';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DashboardService } from '@services/dashboard.service';
import { Dashboard } from '@models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [ButtonModule, TableModule, RouterLink, NgOptimizedImage]
})
export class DashboardComponent implements OnInit {
  dashboard: Dashboard | null = null;
  providers: Provider[] = [];

  constructor(
    private dashboardService: DashboardService,
    private providerService: ProviderService
  ) {
  }

  ngOnInit(): void {
    this.dashboardService.getDashboard().subscribe(dashboard => {
      this.dashboard = dashboard;
    });

    this.providerService.getProviders().subscribe((providers) => {
      this.providers = providers;
    });
  }
}
