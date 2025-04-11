export type Resp<T> = {
  status: number;
};

export type SuccessResp<T> = Resp<T> & {
  data: T;
};

export type ErrorResp = Resp<null> & {
  message: string;
};

export type PaginatedResp<T> = SuccessResp<T> & {
  meta?: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
};

export const Response = {
  success: <T>(data: T, status = 200): SuccessResp<T> => {
    return {
      status,
      data,
    };
  },
  badRequest: (message: string, status = 400): ErrorResp => {
    return {
      status,
      message,
    };
  },
  notFound: (message: string, status = 404): ErrorResp => {
    return {
      status,
      message,
    };
  },
  unauthorized: (message: string, status = 401): ErrorResp => {
    return {
      status,
      message,
    };
  },
  forbidden: (message: string, status = 403): ErrorResp => {
    return {
      status,
      message,
    };
  }
}