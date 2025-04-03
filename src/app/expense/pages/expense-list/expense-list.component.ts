import {
  CurrencyPipe,
  DatePipe,
  NgForOf,
  NgIf,
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault,
} from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ExpenseService } from '@core/services/expense.service';
import { Option } from '@models/option';
import { OptionsService } from '@services/options.service';
import { ToastService } from '@services/toast.service';
import { Expense } from '@shared/models/expense.model';
import { saveAs } from 'file-saver';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { Ripple } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { AbstractCrudComponent } from '../../../maintenance/abstract-crud.component';

@Component({
  standalone: true,
  selector: 'app-expense-list',
  templateUrl: './expense-list.component.html',
  imports: [
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    CardModule,
    ToolbarModule,
    ToastModule,
    ConfirmDialogModule,
    DatePipe,
    CurrencyPipe,
    InputGroup,
    InputGroupAddon,
    NgForOf,
    TooltipModule,
    Ripple,
    NgSwitch,
    NgSwitchCase,
    NgIf,
    NgSwitchDefault,
  ],
  providers: [ConfirmationService],
})
export class ExpenseListComponent
  extends AbstractCrudComponent<Expense>
  implements OnInit
{
  form: FormGroup = this.fb.group({
    id: [null],
    description: [''],
    amount: [0],
    expenseDate: [''],
    category: ['MISCELLANEOUS'],
    receipt: [null],
  });

  override columns = [
    { field: 'expenseDate', header: 'Date' },
    { field: 'description', header: 'Description' },
    { field: 'categoryName', header: 'Category' },
    { field: 'amount', header: 'Amount' },
    { field: 'receiptFilename', header: 'Receipt' },
  ];

  categoryOptions: Option[] = [];

  constructor(
    private router: Router,
    confirmationService: ConfirmationService,
    toastService: ToastService,
    service: ExpenseService,
    private optionsService: OptionsService,
  ) {
    super(confirmationService, toastService, service);
  }

  override ngOnInit() {
    super.ngOnInit();
    this.optionsService.getExpenseCategories().subscribe((data) => {
      this.categoryOptions = data;
    });
  }

  override getEntityName(): string {
    return 'Expense';
  }

  override getEntityDisplayName(entity: Expense): string {
    return entity.description || `Expense on ${entity.expenseDate}`;
  }

  createExpense(): void {
    this.router.navigate(['/expenses/new']);
  }

  editExpense(expense: Expense): void {
    this.router.navigate(['/expenses', expense.id]);
  }

  downloadReceipt(expense: Expense): void {
    if (expense.id && expense.receiptFilename) {
      this.loading = true;
      (this.service as ExpenseService).downloadReceipt(expense.id).subscribe({
        next: (blob) => {
          saveAs(blob, expense.receiptFilename);
          this.loading = false;
        },
        error: (err) => {
          this.toastService.error(
            'Download Failed',
            'Could not download the receipt.',
          );
          console.error(err);
          this.loading = false;
        },
      });
    } else {
      this.toastService.info(
        'No Receipt',
        'No receipt file available for this expense.',
      );
    }
  }

  viewReceipt(expense: Expense): void {
    if (expense.id && expense.receiptFilename) {
      this.loading = true; // Show loading indicator
      (this.service as ExpenseService).downloadReceipt(expense.id).subscribe({
        next: (blob) => {
          // Create a URL for the blob
          const fileURL = URL.createObjectURL(blob);
          // Open the URL in a new tab
          window.open(fileURL, '_blank');
          // Revoke the object URL after some time to free up memory
          setTimeout(() => URL.revokeObjectURL(fileURL), 100);
          this.loading = false;
        },
        error: (err) => {
          this.toastService.error(
            'View Failed',
            'Could not load the receipt for viewing.',
          );
          console.error(err);
          this.loading = false;
        },
      });
    } else {
      this.toastService.info(
        'No Receipt',
        'No receipt file available for this expense.',
      );
    }
  }

  getCategoryLabel(categoryValue: string): string {
    const option = this.categoryOptions.find(
      (opt) => opt.value === categoryValue,
    );
    return option ? option.label : categoryValue;
  }
}
