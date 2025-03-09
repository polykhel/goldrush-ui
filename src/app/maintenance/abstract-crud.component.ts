import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { BaseModel } from '@shared/models/base.model';
import { AbstractCrudService } from '@core/services/abstract-crud.service';
import { ToastService } from '@services/toast.service';

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

  entities: T[] = [];
  columns: { field: string; header: string }[] = [];
  dialogVisible = false;
  submitted = false;

  ngOnInit() {
    this.fetchEntities();
  }

  fetchEntities() {
    this.service.getAll().subscribe(entities => {
      this.entities = entities;
    });
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
        this.fetchEntities();
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
              this.fetchEntities();
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
            this.fetchEntities();
          }
        });
      }
    });
  }

  abstract getEntityName(): string;

  abstract getEntityDisplayName(entity: T): string;
}
