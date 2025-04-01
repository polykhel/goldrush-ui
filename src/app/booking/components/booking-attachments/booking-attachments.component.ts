import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { BookingService } from '@core/services/booking.service';
import { ToastService } from '@core/services/toast.service';
import { Attachment } from '@models/booking.model';
import { saveAs } from 'file-saver';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FileUploadModule } from 'primeng/fileupload';
import { ProgressBarModule } from 'primeng/progressbar';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-booking-attachments',
  standalone: true,
  imports: [
    CommonModule,
    FileUploadModule,
    ProgressBarModule,
    ButtonModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './booking-attachments.component.html',
})
export class BookingAttachmentsComponent implements OnInit {
  @Input() bookingId!: string;
  @Input() attachments: Attachment[] = [];
  uploading = false;
  uploadedFiles: any[] = [];
  @ViewChild('fileUpload', { static: false }) fileUpload!: any;
  @Output() loadAttachments = new EventEmitter<void>();

  constructor(
    private bookingService: BookingService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService,
  ) {}

  ngOnInit(): void {
    this.loadAttachments.emit();
  }

  onFileSelected(event: any): void {
    const files: File[] = event.files;
    if (!files.length) return;

    this.uploading = true;
    const uploadPromises = files.map((file) =>
      firstValueFrom(
        this.bookingService.uploadAttachment(this.bookingId, file),
      ),
    );

    Promise.all(uploadPromises)
      .then(() => {
        this.toastService.success('Success', 'Files uploaded successfully');
        this.uploadedFiles = [...this.uploadedFiles, ...files];
        this.loadAttachments.emit();
      })
      .catch((error) => {
        this.toastService.error('Error', 'Failed to upload files');
        console.error('Error uploading files:', error);
      })
      .finally(() => {
        this.uploading = false;
        this.fileUpload.clear();
      });
  }

  onUploadError(event: any): void {
    this.toastService.error('Error', 'Failed to upload files');
    console.error('Upload error:', event);
  }

  onClear(event: any): void {
    this.uploadedFiles = [];
    console.log('Files cleared:', event);
  }

  downloadAttachment(attachment: Attachment): void {
    this.bookingService
      .downloadAttachment(this.bookingId, attachment.id)
      .subscribe({
        next: (response) => {
          if (response.body) {
            const blob = new Blob([response.body], {
              type:
                response.headers.get('content-type') ||
                'application/octet-stream',
            });
            saveAs(blob, attachment.fileName);
          }
        },
        error: (error) => {
          this.toastService.error('Error', 'Failed to download file');
          console.error('Error downloading file:', error);
        },
      });
  }

  viewAttachment(attachment: Attachment): void {
    this.bookingService
      .downloadAttachment(this.bookingId, attachment.id)
      .subscribe({
        next: (response) => {
          if (response.body) {
            // Create a Blob from the response body
            const blob = new Blob([response.body], {
              type:
                response.headers.get('content-type') ||
                'application/octet-stream',
            });

            // Generate a URL for the Blob
            const fileUrl = URL.createObjectURL(blob);

            // Open the Blob URL in a new tab
            window.open(fileUrl, '_blank');
          }
        },
        error: (error) => {
          this.toastService.error('Error', 'Failed to view file');
          console.error('Error viewing file:', error);
        },
      });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  deleteAttachment(attachment: Attachment): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${attachment.fileName}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.bookingService
          .deleteAttachment(this.bookingId, attachment.id)
          .subscribe({
            next: () => {
              this.toastService.success('Success', 'File deleted successfully');
              this.loadAttachments.emit();
            },
            error: (error) => {
              this.toastService.error('Error', 'Failed to delete file');
              console.error('Error deleting file:', error);
            },
          });
      },
    });
  }
}
