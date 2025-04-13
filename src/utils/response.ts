export type Resp<T> = {
  code: number;
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
  success: <T>(data: T): SuccessResp<T> => {
    return {
      code: 200,
      data,
    };
  },
  error: (code = 500, message: string): ErrorResp => {
    return {
      code,
      message,
    };
  },
  badRequest: (message: string): ErrorResp => {
    return Response.error(400, message);
  },
  notFound: (message: string): ErrorResp => {
    return Response.error(404, message);
  },
  unauthorized: ( message: string): ErrorResp => {
    return Response.error(401, message);
  },
  forbidden: (message: string): ErrorResp => {
    return Response.error(403, message);
  },
};
