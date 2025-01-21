import { User } from './user.model';

export interface Auth {
  jwt: string;
  user: User;
}
