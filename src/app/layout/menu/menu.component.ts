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
          },
          {
            label: 'Reports',
            icon: 'pi pi-file-check',
            items: [
              {
                label: 'Revenue Report',
                icon: 'pi pi-file-check',
                routerLink: ['/reports/revenue'],
              },
              {
                label: 'Service Fees Report',
                icon: 'pi pi-file-check',
                routerLink: ['/reports/service-fees'],
              },
              {
                label: 'Payment Methods Report',
                icon: 'pi pi-file-check',
                routerLink: ['/reports/payment-methods'],
              },
              {
                label: 'Commissions Report',
                icon: 'pi pi-file-check',
                routerLink: ['/reports/commissions'],
              }
            ]
          }
        ]
      },
      {
        label: 'Maintenance',
        items: [
          {
            label: 'Providers',
            icon: 'pi pi-user-edit',
            routerLink: ['/maintenance/providers']
          },
          {
            label: 'Countries',
            icon: 'pi pi-globe',
            routerLink: ['/maintenance/countries']
          },
          {
            label: 'Emails',
            icon: 'pi pi-envelope',
            routerLink: ['/maintenance/emails']
          }
        ]
      }
    ];
  }
}
