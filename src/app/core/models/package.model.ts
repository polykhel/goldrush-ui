import { BaseModel, List } from './base.model';
import { Asset } from './asset.model';

export interface Package extends BaseModel {
  name: string;
  duration: string;
  price: number;
  bookingPeriod: Date;
  travelPeriod: Date;
  inclusions: List[];
  exclusions: List[];
  optionalTours: List[];
  images: Asset[];
}
