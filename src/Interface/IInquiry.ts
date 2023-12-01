import { Request, Response } from "express";

export interface IInquiryRequest extends Request {
  query: {
    eventCode: "00300100" | "00300104";
    transactionDate: string; // Format: yyyy-MM-dd
    billerId: string;
    reference1: string;
    reference2?: string; // Optional
    partnerTransactionId?: string; // Required if eventCode = 00300104
    amount?: string; // Optional (Decimal, 15,2)
    authCode?: string;
  };
}

export interface IInquiryResponse extends Response {
  statusWithJson: (statusCode: number, payload: any) => void;
}
