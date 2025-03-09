import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DestroyService } from '@services/destroy.service';
import { ToastService } from '@services/toast.service';
import { Toast } from 'primeng/toast';
import { takeUntil } from 'rxjs';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { AuthService } from '@auth0/auth0-angular';
import { AsyncPipe } from '@angular/common';
import { LoginComponent } from '../pages/login/login.component';

@Component({
  selector: 'app-home',
  imports: [DashboardComponent, Toast, LoginComponent, AsyncPipe],
  templateUrl: './home.component.html',
  standalone: true
})
export class HomeComponent implements OnInit {

  constructor(
    public auth: AuthService,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private destroy$: DestroyService
  ) {
  }

  ngOnInit(): void {
    this.route.queryParams
    .pipe(takeUntil(this.destroy$))
    .subscribe((params) => {
      if (params['loginRequired']) {
        this.toastService.showDelayedMessage(
          'warn',
          'Login Required',
          'Please log in to access this page'
        );
      } else if (params['logout']) {
        this.toastService.showDelayedMessage(
          'info',
          'Logged Out',
          'You have been successfully logged out'
        );
      }
    });
  }
}
