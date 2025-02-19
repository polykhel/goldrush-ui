import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { DestroyService } from '@services/destroy.service';
import { LoginComponent } from '@shared/components/login/login.component';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { takeUntil } from 'rxjs';
import { DashboardComponent } from '../dashboard/dashboard.component';

@Component({
  selector: 'app-home',
  imports: [DashboardComponent, Toast, LoginComponent],
  templateUrl: './home.component.html',
  providers: [MessageService],
})
export class HomeComponent implements OnInit {
  isLoggedIn = false;

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
          this.showDelayedMessage(
            'warn',
            'Login Required',
            'Please log in to access this page',
          );
        } else if (params['logout']) {
          this.showDelayedMessage(
            'info',
            'Logged Out',
            'You have been successfully logged out',
          );
        }
      });
  }

  /**
   * Helper method to show a message with a delay using setTimeout.
   * @param severity - Severity of the message (e.g., 'info', 'warn').
   * @param summary - Summary of the message.
   * @param detail - Detailed description of the message.
   */
  private showDelayedMessage(
    severity: string,
    summary: string,
    detail: string,
  ): void {
    setTimeout(() => {
      this.messageService.add({
        severity,
        summary,
        detail,
      });
    }, 0);
  }
}
