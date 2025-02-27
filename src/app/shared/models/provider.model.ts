import { BaseModel } from './base.model';

export interface Provider extends BaseModel {
  name: string;
  trackerLink: string;
  email: string;
  logo: string;
}
