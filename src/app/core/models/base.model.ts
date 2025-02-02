export interface SingleData<T extends BaseModel> {
  data: T
}

export interface ListData<T extends BaseModel> {
  data: T[],
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    }
  }
}

export interface BaseModel {
  id?: number;
  documentId?: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  publishedAt?: Date | null;
}

export interface AuditedBaseModel extends BaseModel {
  creator?: string | null;
  modifier?: string | null;
}

export interface List {
  id?: number;
  title: string;
}
