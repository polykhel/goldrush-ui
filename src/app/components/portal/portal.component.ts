import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Panel } from 'primeng/panel';

@Component({
  selector: 'app-portal',
  imports: [FormsModule, Panel],
  templateUrl: './portal.component.html',
  styleUrl: './portal.component.css',
})
export class PortalComponent {}
