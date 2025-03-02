import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '@shared/components/navbar/navbar.component';
import { SidebarComponent } from '@shared/components/sidebar/sidebar.component';
import { AuthService } from '@auth0/auth0-angular';
import { PageLoaderComponent } from '@shared/components/page-loader/page-loader.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, SidebarComponent, PageLoaderComponent, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true,
})
export class AppComponent implements OnInit {
  isLoggedIn = false;

  constructor(public auth: AuthService) {}

  ngOnInit() {
    this.auth.isAuthenticated$.subscribe((authenticated) => {
      this.isLoggedIn = authenticated;
    });
  }
}
