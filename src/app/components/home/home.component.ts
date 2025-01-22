import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { environment } from '@env/environment';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { PortalComponent } from '../portal/portal.component';

@Component({
  selector: 'app-home',
  imports: [Button, Card, NgIf, PortalComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private baseUrl = environment.backendUrl;
  isLoggedIn = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
  }

  login() {
    window.location.href = `${this.baseUrl}/api/connect/google`;
  }
}
