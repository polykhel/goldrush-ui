import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { Toolbar } from 'primeng/toolbar';
import { PrimeTemplate } from 'primeng/api';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { InputGroup, InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';

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
    InputText,
    FormsModule,
    ConfirmDialog,
    InputGroup,
    InputGroupModule,
    InputGroupAddon
  ],
  standalone: true
})
export class Crud<T> {
  @Input() entities: T[] = [];
  @Input() columns: ColumnConfig[] = [];
  @Input() entityName: string = 'Entity';
  @Input() totalRecords: number = 0;
  @Input() loading: boolean = false;
  @Input() sortField: string = 'createdAt';
  @Input() sortOrder: number = -1;
  @Input() searchTerm: string = '';

  @Output() create = new EventEmitter<T>();
  @Output() update = new EventEmitter<T>();
  @Output() delete = new EventEmitter<T>();
  @Output() deleteMultiple = new EventEmitter<T[]>();
  @Output() lazyLoad = new EventEmitter<TableLazyLoadEvent>();
  @Output() search = new EventEmitter<any>();
  @Output() sort = new EventEmitter<TableLazyLoadEvent>();
  @Output() page = new EventEmitter<any>();

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

  onGlobalFilter(event: Event) {
    this.search.emit(event);
  }

  onLazyLoad(event: TableLazyLoadEvent) {
    this.lazyLoad.emit(event);
  }

  onSort(event: TableLazyLoadEvent) {
    this.sort.emit(event);
  }

  onPage(event: any) {
    this.page.emit(event);
  }

  exportCSV() {
    this.dt.exportCSV();
  }
}
