import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { DestroyService } from '@services/destroy.service';
import { ToastService } from '@services/toast.service';
import { LoginComponent } from '@shared/components/login/login.component';
import { Toast } from 'primeng/toast';
import { takeUntil } from 'rxjs';
import { DashboardComponent } from '../dashboard/dashboard.component';

@Component({
  selector: 'app-home',
  imports: [DashboardComponent, Toast, LoginComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  isLoggedIn = false;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private destroy$: DestroyService,
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();

    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        if (params['loginRequired']) {
          this.toastService.showDelayedMessage(
            'warn',
            'Login Required',
            'Please log in to access this page',
          );
        } else if (params['logout']) {
          this.toastService.showDelayedMessage(
            'info',
            'Logged Out',
            'You have been successfully logged out',
          );
        }
      });
  }
}
