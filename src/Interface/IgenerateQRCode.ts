export interface IBodyGenQR {
  qrType: "PP" | "CS" | "PPCS";
  ppType: "BILLERID"; //BILLERID
  ppId: string; // ความยาว 15 ตัว
  amount: string; // ความยาวไม่เกิน 13 ตัว
  ref1: string; // ความยาวไม่เกิน 20 ตัวอักษร [A-Z0-9]
  ref2?: string; // ความยาวไม่เกิน 20 ตัวอักษร [A-Z0-9]
  ref3?: string; // ความยาวไม่เกิน 20 ตัวอักษร [A-Z0-9]
}
