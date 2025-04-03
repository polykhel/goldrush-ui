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
import { OptionsService } from '@services/options.service'; // Assuming OptionsService provides category options
import { ToastService } from '@services/toast.service';
import { saveAs } from 'file-saver'; // Import file-saver
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { DatePicker } from 'primeng/datepicker';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { FloatLabel } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { Ripple } from 'primeng/ripple';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { Toast } from 'primeng/toast'; // For receipt upload
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    CalendarModule,
    DropdownModule,
    ButtonModule,
    FileUploadModule,
    TooltipModule,
    Ripple,
    FloatLabel,
    Toast,
    Textarea,
    DatePicker,
    Select,
    // Use InputTextarea component here
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
    private optionsService: OptionsService, // Inject OptionsService
  ) {
    this.expenseForm = this.fb.group({
      description: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      expenseDate: [new Date(), Validators.required], // Default to today
      category: [null, Validators.required],
      receipt: [null], // File upload control
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
            : null, // Convert string date to Date object
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
    // PrimeNG FileUpload basic mode might use event.files[0]
    const file = event.files ? event.files[0] : null;
    if (file) {
      this.selectedFile = file;
      this.existingReceiptFilename = null; // Clear existing filename if new file is chosen
      this.expenseForm.patchValue({ receipt: file }); // Update form value if needed by validation
      this.expenseForm.get('receipt')?.markAsDirty();
    }
  }

  onFileRemove(): void {
    this.selectedFile = null;
    this.expenseForm.patchValue({ receipt: null });
    this.expenseForm.get('receipt')?.markAsDirty();
    // Keep existingReceiptFilename if user just clears the selection without uploading new
  }

  // Method to download the existing receipt
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

  // Method to view the existing receipt
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
      this.expenseForm.markAllAsTouched(); // Mark fields to show validation errors
      this.toastService.warn(
        'Validation Error',
        'Please fill in all required fields correctly.',
      ); // Use .warn()
      return;
    }

    this.isLoading = true;
    const formData = new FormData();
    const formValue = this.expenseForm.value;

    // Append form fields to FormData
    formData.append('description', formValue.description);
    formData.append('amount', formValue.amount.toString());
    // Format date to ISO string (YYYY-MM-DD) which backend expects for LocalDate
    formData.append(
      'expenseDate',
      new Date(formValue.expenseDate).toISOString().split('T')[0],
    );
    formData.append('category', formValue.category);

    // Append file if selected
    if (this.selectedFile) {
      // Use 'receiptFile' to match the backend DTO field name
      formData.append('receiptFile', this.selectedFile, this.selectedFile.name);
    } else if (!this.isEditMode || !this.existingReceiptFilename) {
      // If creating or editing and removing existing receipt, explicitly send null or handle on backend
      // Depending on backend logic, you might not need to append anything if no file is present
      // formData.append('receipt', ''); // Or handle null on backend
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
