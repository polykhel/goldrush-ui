import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Menubar } from 'primeng/menubar';

@Component({
  selector: 'app-root',
  imports: [Menubar, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  items: MenuItem[] | undefined;

  constructor(private router: Router) {}

  ngOnInit() {
    this.items = [
      {
        label: 'Home',
        icon: 'pi pi-home',
        command: () => {
          this.router.navigate(['/']);
        },
      },
      {
        label: 'Inquiry Form',
        icon: 'pi pi-envelope',
        command: () => {
          this.router.navigate(['/inquiry-form']);
        },
      },
      {
        label: 'Quotation Generator',
        icon: 'pi pi-file-word',
        command: () => {
          this.router.navigate(['/quotation-generator']);
        },
      },
      {
        label: 'Payment Scheduler',
        icon: 'pi pi-wallet',
        command: () => {
          this.router.navigate(['/payment-scheduler']);
        },
      },
      {
        label: 'Tools',
        icon: 'pi pi-wrench',
        items: [
          {
            label: 'List to JSON',
            icon: 'pi pi-file-json',
            command: () => {
              this.router.navigate(['/tools/list-to-json']);
            },
          }
        ]
      },
    ];
  }
}
