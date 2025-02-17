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
