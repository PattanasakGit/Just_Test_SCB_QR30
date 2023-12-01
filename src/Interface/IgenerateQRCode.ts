import { Request, Response } from "express";

export interface IBodyGenQRRequest extends Request {
  body: IBodyGenQR;
}

export interface IBodyGenQRResponse extends Response {
  statusWithJson: (statusCode: number, payload: any) => void;
}

export interface IBodyGenQR {
  qrType: string; // 2 ตัวเท่านั้น
  ppType: string; //BILLERID
  ppId: string; // ความยาว 15 ตัว
  amount: string; // ความยาวไม่เกิน 13 ตัว
  ref1: string; // ความยาวไม่เกิน 20 ตัวอักษร [A-Z0-9]
  ref2: string; // ความยาวไม่เกิน 20 ตัวอักษร [A-Z0-9]
  ref3: string; // ความยาวไม่เกิน 20 ตัวอักษร [A-Z0-9]
  query?: string;
}
