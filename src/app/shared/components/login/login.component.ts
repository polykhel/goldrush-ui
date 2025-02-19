import { Component } from '@angular/core';
import { environment } from '@env/environment';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [Button],
})
export class LoginComponent {

  private baseUrl = environment.backendUrl;

  login() {
    window.location.href = `${this.baseUrl}/oauth2/authorization/google`;
  }
}
