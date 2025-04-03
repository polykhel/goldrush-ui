import { BaseModel } from './base.model';

export interface Expense extends BaseModel {
  description: string;
  amount: number;
  expenseDate: string;
  category: string;
  categoryName?: string;
  receiptFilename?: string;
  receiptContentType?: string;
  receiptDownloadUrl?: string;
}
