import { BaseModel } from './base.model';

export interface User extends BaseModel {
  name: string;
  username: string;
  email: string;
  profileImage: string;
}
