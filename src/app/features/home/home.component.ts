import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { environment } from '@env/environment';
import { DestroyService } from '@services/destroy.service';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Toast } from 'primeng/toast';
import { takeUntil } from 'rxjs';
import { DashboardComponent } from '../dashboard/dashboard.component';

@Component({
  selector: 'app-home',
  imports: [Button, NgIf, DashboardComponent, Toast],
  templateUrl: './home.component.html',
  providers: [MessageService],
})
export class HomeComponent implements OnInit {
  isLoggedIn = false;
  private baseUrl = environment.backendUrl;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private destroy$: DestroyService,
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();

    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        if (params['loginRequired']) {
          setTimeout(() => {
            this.messageService.add({
              severity: 'warn',
              summary: 'Login Required',
              detail: 'Please log in to access this page',
            });
          }, 0);
          this.show();
        } else if (params['logout']) {
          setTimeout(() => {
            this.messageService.add({
              severity: 'info',
              summary: 'Logged Out',
              detail: 'You have been successfully logged out',
            });
          }, 0);
        }
      });
  }

  show() {
    this.messageService.add({
      severity: 'info',
      summary: 'Info',
      detail: 'Message Content',
    });
  }

  login() {
    window.location.href = `${this.baseUrl}/api/connect/google`;
  }
}
