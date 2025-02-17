import { NgClass } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
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
  isFullyHidden = false;
  transitionDuration = 300;
  items: MenuItem[] = [];

  _collapsed = false;

  get collapsed() {
    return this._collapsed;
  }

  @Input() set collapsed(value: boolean) {
    this._collapsed = value;

    if (this.collapsed) {
      setTimeout(() => {
        this.isFullyHidden = true;
      }, this.transitionDuration);
    } else {
      this.isFullyHidden = false;
    }
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
