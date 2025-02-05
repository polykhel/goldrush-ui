import { BaseModel, List } from './base.model';

export interface Country extends BaseModel {
  name: string;
  code: string;
  iataCodes: List[];
}
