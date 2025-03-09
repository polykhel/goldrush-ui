import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { BaseModel } from '@shared/models/base.model';
import { AbstractCrudService, PageRequest } from '@core/services/abstract-crud.service';
import { ToastService } from '@services/toast.service';
import { TableLazyLoadEvent } from 'primeng/table';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  template: ''
})
export abstract class AbstractCrudComponent<T extends BaseModel> implements OnInit {
  protected fb = inject(NonNullableFormBuilder);

  protected constructor(
    protected confirmationService: ConfirmationService,
    protected toastService: ToastService,
    protected service: AbstractCrudService<T>) {
  }

  abstract form: FormGroup;

  // Entity data
  entities: T[] = [];
  columns: { field: string; header: string }[] = [];

  // Dialog state
  dialogVisible = false;
  submitted = false;

  // Pagination and sorting properties
  first = 0;
  rows = 10;
  totalRecords: number = 0;
  loading: boolean = false;
  sortField: string = 'createdAt';
  sortOrder: number = -1; // -1 for descending, 1 for ascending

  // Search
  searchTerm: string = '';
  protected searchSubject = new Subject<string>();

  ngOnInit() {
    this.setupSearch();
    // Initial load
    this.loadEntities();
  }

  setupSearch() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.first = 0; // Reset to first page when searching
      this.loadEntities();
    });
  }

  loadEntities() {
    this.loading = true;

    const pageRequest: PageRequest = {
      page: this.first / this.rows,
      size: this.rows,
      sort: this.sortField,
      direction: this.sortOrder === 1 ? 'asc' : 'desc',
      searchTerm: this.searchTerm
    };

    this.service.getPaginated(pageRequest).subscribe(response => {
      this.entities = response.content || [];
      this.totalRecords = response.page.totalElements;
      this.loading = false;
    });
  }

  onSearch(event: any) {
    this.searchTerm = event.target.value;
    this.searchSubject.next(this.searchTerm);
  }

  onSort(event: TableLazyLoadEvent) {
    this.sortField = event.sortField?.toString() ?? 'createdAt';
    this.sortOrder = event.sortOrder ?? -1;
    this.loadEntities();
  }

  onPage(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.loadEntities();
  }

  openDialog(selectedEntity: T) {
    this.dialogVisible = true;
    this.submitted = false;
    this.form.reset();
    this.form.patchValue(selectedEntity);
  }

  hideDialog() {
    this.dialogVisible = false;
    this.submitted = false;
  }

  saveEntity() {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    this.service.save(this.form.getRawValue()).subscribe({
      next: () => {
        this.hideDialog();
        this.toastService.success(`${this.getEntityName()} Saved`, `The ${this.getEntityName().toLowerCase()} has been saved successfully`);
        this.loadEntities();
      }
    });
  }

  deleteEntity(entity: T) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the ${this.getEntityName().toLowerCase()} ${this.getEntityDisplayName(entity)}?`,
      accept: () => {
        if (entity.id) {
          this.service.delete(entity.id).subscribe({
            next: () => {
              this.toastService.success(
                `${this.getEntityName()} Deleted`,
                `The ${this.getEntityName().toLowerCase()} ${this.getEntityDisplayName(entity)} has been deleted successfully`);
              this.loadEntities();
            }
          });
        }
      }
    });
  }

  deleteSelectedEntities(entities: T[]) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the selected ${this.getEntityName().toLowerCase()}s?`,
      accept: () => {
        const ids = entities.map(entity => entity.id).filter(id => id !== null);
        this.service.deleteMultiple(ids).subscribe({
          next: () => {
            this.toastService.success(
              `${this.getEntityName()}s Deleted`,
              `The ${this.getEntityName().toLowerCase()}s have been deleted successfully`);
            this.loadEntities();
          }
        });
      }
    });
  }

  abstract getEntityName(): string;
  abstract getEntityDisplayName(entity: T): string;
}
