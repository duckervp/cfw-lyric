import { HTTPException } from "hono/http-exception";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { Response } from "./response";

export class ApiException extends HTTPException {
  public code: number;

  constructor(code: number = 500, message: string,) {
    const json = JSON.stringify(Response.error(code, message));
    super(code as ContentfulStatusCode, {message: json});
    this.code = code;
    Object.setPrototypeOf(this, ApiException.prototype);
  }
}