import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ExpenseService } from '@core/services/expense.service';
import { Option } from '@models/option';
import { OptionsService } from '@services/options.service';
import { ToastService } from '@services/toast.service';
import dayjs from 'dayjs';
import { saveAs } from 'file-saver';
import { DatePicker } from 'primeng/datepicker';
import { FloatLabel } from 'primeng/floatlabel';
import { InputNumber } from 'primeng/inputnumber';
import { Ripple } from 'primeng/ripple';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { Toast } from 'primeng/toast';
import { FileUpload } from 'primeng/fileupload';
import { Tooltip } from 'primeng/tooltip';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    Ripple,
    FloatLabel,
    Toast,
    Textarea,
    DatePicker,
    Select,
    FileUpload,
    Tooltip,
    Button,
    InputNumber,
  ],
  templateUrl: './expense-form.component.html',
})
export class ExpenseFormComponent implements OnInit {
  expenseForm: FormGroup;
  isEditMode = false;
  expenseId: string | null = null;
  categoryOptions: Option[] = [];
  selectedFile: File | null = null;
  existingReceiptFilename: string | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService,
    private optionsService: OptionsService,
  ) {
    this.expenseForm = this.fb.group({
      description: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      expenseDate: [new Date(), Validators.required],
      category: [null, Validators.required],
      receipt: [null],
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.expenseId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.expenseId;

    if (this.isEditMode && this.expenseId) {
      this.loadExpenseData(this.expenseId);
    }
  }

  loadCategories(): void {
    this.optionsService.getExpenseCategories().subscribe((data) => {
      this.categoryOptions = data;
    });
  }

  loadExpenseData(id: string): void {
    this.isLoading = true;
    this.expenseService.getById(id).subscribe({
      next: (expense) => {
        this.expenseForm.patchValue({
          ...expense,
          expenseDate: expense.expenseDate
            ? new Date(expense.expenseDate)
            : null,
        });
        this.existingReceiptFilename = expense.receiptFilename || null;
        this.isLoading = false;
      },
      error: () => {
        this.toastService.error('Error', 'Failed to load expense data.');
        this.router.navigate(['/expenses']);
        this.isLoading = false;
      },
    });
  }

  onFileSelect(event: any): void {
    const file = event.files ? event.files[0] : null;
    if (file) {
      this.selectedFile = file;
      this.existingReceiptFilename = null;
      this.expenseForm.patchValue({ receipt: file });
      this.expenseForm.get('receipt')?.markAsDirty();
    }
  }

  onFileRemove(): void {
    this.selectedFile = null;
    this.expenseForm.patchValue({ receipt: null });
    this.expenseForm.get('receipt')?.markAsDirty();
  }

  downloadExistingReceipt(): void {
    if (this.expenseId && this.existingReceiptFilename) {
      this.isLoading = true;
      this.expenseService.downloadReceipt(this.expenseId).subscribe({
        next: (blob) => {
          saveAs(blob, this.existingReceiptFilename!);
          this.isLoading = false;
        },
        error: (err) => {
          this.toastService.error(
            'Download Failed',
            'Could not download the receipt.',
          );
          console.error(err);
          this.isLoading = false;
        },
      });
    }
  }

  viewExistingReceipt(): void {
    if (this.expenseId && this.existingReceiptFilename) {
      this.isLoading = true;
      this.expenseService.downloadReceipt(this.expenseId).subscribe({
        next: (blob) => {
          const fileURL = URL.createObjectURL(blob);
          window.open(fileURL, '_blank');
          setTimeout(() => URL.revokeObjectURL(fileURL), 100);
          this.isLoading = false;
        },
        error: (err) => {
          this.toastService.error(
            'View Failed',
            'Could not load the receipt for viewing.',
          );
          console.error(err);
          this.isLoading = false;
        },
      });
    }
  }

  onSubmit(): void {
    if (this.expenseForm.invalid) {
      this.expenseForm.markAllAsTouched();
      this.toastService.warn(
        'Validation Error',
        'Please fill in all required fields correctly.',
      );
      return;
    }

    this.isLoading = true;
    const formData = new FormData();
    const formValue = this.expenseForm.value;

    formData.append('description', formValue.description);
    formData.append('amount', formValue.amount.toString());
    formData.append(
      'expenseDate',
      dayjs(formValue.expenseDate).format('YYYY-MM-DD'),
    );
    formData.append('category', formValue.category);

    if (this.selectedFile) {
      formData.append('receiptFile', this.selectedFile, this.selectedFile.name);
    }
    // If editing and keeping the existing receipt, don't append the file field

    const saveObservable =
      this.isEditMode && this.expenseId
        ? this.expenseService.updateExpense(this.expenseId, formData)
        : this.expenseService.createExpense(formData);

    saveObservable.subscribe({
      next: () => {
        this.toastService.success(
          'Success',
          `Expense ${this.isEditMode ? 'updated' : 'created'} successfully.`,
        );
        this.router.navigate(['/expenses']);
        this.isLoading = false;
      },
      error: (err) => {
        this.toastService.error(
          'Error',
          `Failed to ${this.isEditMode ? 'update' : 'create'} expense.`,
        );
        console.error(err);
        this.isLoading = false;
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/expenses']);
  }
}
