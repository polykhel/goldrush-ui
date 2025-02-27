import { NgForOf, NgOptimizedImage } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Provider } from '@models/provider.model';
import { ProviderService } from '@services/provider.service';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';

interface Activity {
  date: string;
  type: string;
  customer: string;
  status: string;
  id: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  standalone: true,
  imports: [ButtonModule, TableModule, RouterLink, NgOptimizedImage, NgForOf],
})
export class DashboardComponent implements OnInit {
  recentActivities: Activity[] = [
    {
      date: '2024-03-20',
      type: 'Inquiry',
      customer: 'John Smith',
      status: 'Pending',
      id: 1,
    },
    // Add more mock data as needed
  ];
  providers: Provider[] = [];

  constructor(private providerService: ProviderService) {}

  ngOnInit(): void {
    this.providerService.getProviders().subscribe((providers) => {
      this.providers = providers;
    });
  }

  viewActivity(activity: Activity): void {
    // Implement view logic
    console.log('Viewing activity:', activity);
  }
}
