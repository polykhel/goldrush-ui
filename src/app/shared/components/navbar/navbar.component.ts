import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, MenubarModule],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  items: MenuItem[] = [];

  constructor(public authService: AuthService) {
    this.authService.currentUser$.subscribe(() => {
      this.updateMenuItems();
    });
  }

  logout() {
    this.authService.logout();
    // Force a page refresh to clear any sensitive data and reset the UI state
    window.location.href = '/home?logout=true';
  }

  private updateMenuItems() {
    const isLoggedIn = this.authService.isLoggedIn();

    this.items = [
      {
        label: 'Home',
        routerLink: '/home',
      },
      {
        label: 'Inquiries',
        routerLink: '/inquiries',
        visible: isLoggedIn,
      },
      {
        label: 'Quotations',
        routerLink: '/quotations',
        visible: isLoggedIn,
      },
      {
        label: 'Payment Scheduler',
        routerLink: '/payments',
        visible: isLoggedIn,
      },
      {
        label: 'Tools',
        visible: isLoggedIn,
        items: [
          {
            label: 'List to JSON',
            routerLink: '/tools/list-to-json',
          },
        ],
      },
    ];
  }
}
