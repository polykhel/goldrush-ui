export interface SingleData<T extends BaseModel> {
  data: T
}

export interface ListData<T extends BaseModel> {
  content: T[],
  data: T[],
  empty: boolean,
  first: boolean,
  last: boolean,
  number: number,
  numberOfElements: number,
  pageable: {
    offset: number,
    pageNumber: number,
    pageSize: number,
    paged: boolean,
  },
  page: {
    number: number,
    size: number,
    totalElements: number,
    totalPages: boolean,
  },
  size: number,
  sort: {
    empty: boolean,
    sorted: boolean,
    unsorted: boolean,
  },
  totalElements: number,
  totalPages: number,
}

export interface BaseModel {
  id: string | null;
  //TODO: Delete
  documentId?: string;
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
