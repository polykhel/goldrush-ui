import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '@shared/components/navbar/navbar.component';
import { SidebarComponent } from '@shared/components/sidebar/sidebar.component';
import { AuthService } from '@auth0/auth0-angular';
import { PageLoaderComponent } from '@shared/components/page-loader/page-loader.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent, PageLoaderComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  isLoggedIn = false;

  @ViewChild('mainContent') mainContent!: ElementRef;
  showScrollButton = false;

  constructor(public auth: AuthService) {
  }

  ngOnInit() {
    this.auth.isAuthenticated$.subscribe((authenticated) => {
      this.isLoggedIn = authenticated;
    });
  }

  onScroll(event: Event): void {
    const element = event.target as HTMLElement;
    this.showScrollButton = element.scrollTop > 300;
  }
}
