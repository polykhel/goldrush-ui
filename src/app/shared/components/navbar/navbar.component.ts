import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { User } from '@models/user.model';
import { AuthService } from '@services/auth.service';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    MenubarModule,
    MenuModule,
    NgOptimizedImage,
  ],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  currentUser$: Observable<User | null>;
  items: MenuItem[] = [
    {
      label: 'Profile',
      routerLink: '/home',
      icon: 'pi pi-user',
    },
    {
      label: 'Logout',
      command: () => this.logout(),
      icon: 'pi pi-sign-out',
    },
  ];

  constructor(public authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;
  }

  logout() {
    this.authService.logout();
    // Force a page refresh to clear any sensitive data and reset the UI state
    window.location.href = '/home?logout=true';
  }
}
