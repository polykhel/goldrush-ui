import { BaseModel } from './base.model';

export interface User extends BaseModel {
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
}
