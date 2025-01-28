import { NgOptimizedImage } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
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
  imports: [
    ButtonModule,
    TableModule,
    RouterLink,
    NgOptimizedImage
  ]
})
export class DashboardComponent implements OnInit {
  recentActivities: Activity[] = [
    {
      date: '2024-03-20',
      type: 'Inquiry',
      customer: 'John Smith',
      status: 'Pending',
      id: 1
    },
    // Add more mock data as needed
  ];

  constructor() {}

  ngOnInit(): void {
    // Fetch real data here
  }

  viewActivity(activity: Activity): void {
    // Implement view logic
    console.log('Viewing activity:', activity);
  }
}
