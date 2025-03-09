export interface ListData<T extends BaseModel> {
  content: T[],
  page: {
    number: number,
    size: number,
    totalElements: number,
    totalPages: boolean,
  }
}

export interface BaseModel {
  id: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface AuditedBaseModel extends BaseModel {
  createdBy?: string | null;
  updatedBy?: string | null;
}

export interface AuditFields {
  createdAt?: Date | null;
  createdBy?: string | null;
  updatedAt?: Date | null;
  updatedBy?: string | null;
}

export interface List {
  id?: number;
  title: string;
}
