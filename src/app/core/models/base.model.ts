export interface SingleData<T extends BaseModel> {
  data: T
}

export interface ListData<T extends BaseModel> {
  data: T[]
}

export interface BaseModel {
  id: number;
  documentId: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
}

export interface List {
  id: number;
  title: string;
}
