import { BaseModel } from '@models/base.model';

export interface Email extends BaseModel {
  from?: string;
  to: string;
  subject: string;
  body: string;
}
