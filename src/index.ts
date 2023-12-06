import express from "express";
import { SCBAdapter } from "./SCBAdapter";
import { IPaymentConfirmation } from "./Interface/IPaymentConfirmation";
import { IBodyGenQR } from "./Interface/IgenerateQRCode";
import { IInquiry } from "./Interface/IInquiry";
import * as uuid from "uuid";

const app = express();
const PORT = process.env.PORT || 3000;
const scbAdapter = new SCBAdapter();

app.use(express.json());

app.post("/generate-qrcode", async (req, res: any) => {
  const data: IBodyGenQR = req.body;
  const result = await scbAdapter.generateQRCode(uuid.v4(), data);
  res.status(result.statusCode).json(result.data);
});

app.post("/PaymentConfirmation", async (req, res) => {
  const body: IPaymentConfirmation = req.body;
  const result = await scbAdapter.paymentConfirmation(body);
  res.status(result.statusCode).json(result.data);
});

app.get("/Inquiry", async (req, res) => {
  // const authCode = req.query.authCode;
  const {
    eventCode,
    billerId,
    reference1,
    reference2,
    transactionDate,
    amount,
  } = req.query;
  const params: IInquiry = {
    eventCode: eventCode as "00300100" | "00300104",
    billerId: billerId as string,
    reference1: reference1 as string,
    reference2: reference2 as string | undefined,
    transactionDate: transactionDate as string,
    amount: amount as string | undefined,
  };
  const result = await scbAdapter.Inquiry(uuid.v4(), params);
  res.status(result.statusCode).json(result.data);
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
