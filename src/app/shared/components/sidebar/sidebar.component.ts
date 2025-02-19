import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  standalone: true,
  imports: [MenuModule, RouterModule, NgClass],
})
export class SidebarComponent implements OnInit {
  items: MenuItem[] = [];

  constructor() {
  }

  ngOnInit() {
    this.items = [
      {
        label: 'Home',
        icon: 'pi pi-home',
        routerLink: ['/'],
      },
      {
        label: 'Inquiries',
        icon: 'pi pi-address-book',
        routerLink: ['/inquiries'],
      },
      {
        label: 'Bookings',
        icon: 'pi pi-calendar',
        routerLink: ['/bookings'],
      },
    ];
  }
}
