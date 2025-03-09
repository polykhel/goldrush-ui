import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { NgIf } from '@angular/common';
import { MenuItemComponent } from "../menu-item/menu-item.component";

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  imports: [NgIf, MenuItemComponent],
  standalone: true
})
export class MenuComponent implements OnInit {
  items: MenuItem[] = [];

  constructor() {
  }

  ngOnInit() {
    this.items = [
      {
        label: 'Home',
        items: [
          {
            label: 'Dashboard',
            icon: 'pi pi-home',
            routerLink: ['/']
          },
          {
            label: 'Inquiries',
            icon: 'pi pi-address-book',
            routerLink: ['/inquiries']
          },
          {
            label: 'Payments',
            icon: 'pi pi-money-bill',
            routerLink: ['/payments']
          },
          {
            label: 'Bookings',
            icon: 'pi pi-calendar',
            routerLink: ['/bookings']
          }
        ]
      }
    ];
  }
}
