import { Component } from '@angular/core';
import { Button } from 'primeng/button';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [Button]
})
export class LoginComponent {

  constructor(private auth: AuthService) {
  }

  login() {
    this.auth.loginWithRedirect();
  }
}
