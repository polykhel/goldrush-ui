import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { DestroyService } from '../services/destroy.service';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-auth-callback',
  template: '<p>Processing authentication...</p>',
})
export class AuthCallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private destroy$: DestroyService,
  ) {}

  ngOnInit() {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        if (!params) {
          return;
        }
        this.authService.login(params['access_token']).subscribe(() => {
          this.router.navigate(['/']);
        });
      });
  }
}
