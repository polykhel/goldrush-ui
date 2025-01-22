import { NgClass, NgForOf } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataView } from 'primeng/dataview';
import { Panel } from 'primeng/panel';
import { SelectButton } from 'primeng/selectbutton';
import { Tag } from 'primeng/tag';

@Component({
  selector: 'app-portal',
  imports: [SelectButton, DataView, NgClass, Tag, FormsModule, NgForOf, Panel],
  templateUrl: './portal.component.html',
  styleUrl: './portal.component.css',
})
export class PortalComponent {
  layout: 'list' | 'grid' = 'grid';

  products = signal<any>([]);

  options = ['list', 'grid'];
}
