export interface IInquiry {
  eventCode: "00300100" | "00300104";
  transactionDate: string;
  billerId: string;
  reference1: string;
  reference2?: string;
  amount?: string; // Optional (Decimal, 15,2)
}
