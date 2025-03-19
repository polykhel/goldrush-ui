import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { ToastService } from '@services/toast.service';
import { Toast } from 'primeng/toast';
import { DashboardComponent } from '../dashboard/dashboard.component';
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
  ) {
  }

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed())
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
