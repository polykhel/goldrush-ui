import { BaseModel } from './base.model';

export interface Country extends BaseModel {
  name: string;
  code: string;
  flag: string
}
