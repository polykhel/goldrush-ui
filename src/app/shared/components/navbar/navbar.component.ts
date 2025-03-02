import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    MenubarModule,
    MenuModule,
    NgOptimizedImage
  ],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  items: MenuItem[] = [
    {
      label: 'Profile',
      routerLink: '/home',
      icon: 'pi pi-user'
    },
    {
      label: 'Logout',
      command: () => this.logout(),
      icon: 'pi pi-sign-out'
    }
  ];

  constructor(public auth: AuthService) {
  }

  logout() {
    this.auth.logout({logoutParams: {returnTo: window.location.origin + '/home?logout=true'}});
  }
}
