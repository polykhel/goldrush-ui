import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { Toolbar } from 'primeng/toolbar';
import { PrimeTemplate } from 'primeng/api';
import { Button } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ConfirmDialog } from 'primeng/confirmdialog';

export interface ColumnConfig {
  field: string;
  header: string;
  customExportHeader?: string;
}

@Component({
  selector: 'app-crud',
  templateUrl: './crud.component.html',
  imports: [
    Toolbar,
    PrimeTemplate,
    Button,
    TableModule,
    IconField,
    InputIcon,
    InputText,
    FormsModule,
    ConfirmDialog
  ],
  standalone: true
})
export class Crud<T> {
  @Input() entities: T[] = [];
  @Input() columns: ColumnConfig[] = [];
  @Input() entityName: string = 'Entity';

  @Output() create = new EventEmitter<T>();
  @Output() update = new EventEmitter<T>();
  @Output() delete = new EventEmitter<T>();
  @Output() deleteMultiple = new EventEmitter<T[]>();

  @ViewChild('dt') dt!: Table;

  selectedEntity!: T;
  selectedEntities: T[] = [];

  get globalFilterFields() {
    return this.columns.map(c => c.field);
  }

  onCreateNew() {
    this.selectedEntity = {} as T;
    this.create.emit(this.selectedEntity);
  }

  onEdit(entity: T) {
    this.selectedEntity = {...entity};
    this.update.emit(this.selectedEntity);
  }

  onDelete(entity: T) {
    this.delete.emit(entity);
  }

  onDeleteSelected() {
    this.deleteMultiple.emit(this.selectedEntities);
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  exportCSV() {
    this.dt.exportCSV();
  }

}
