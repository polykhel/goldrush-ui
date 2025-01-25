import { BaseModel } from './base.model';

export interface User extends BaseModel {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
}
