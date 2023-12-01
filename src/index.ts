import express from "express";
import { SCBAdapter } from "./Adapter";

const app = express();
const PORT = process.env.PORT || 3000;
const scbAdapter = new SCBAdapter();

app.use(express.json());

app.post("/generate-qrcode", async (req, res: any) => {
  await scbAdapter.generateQRCode(req, res);
});

app.post("/PaymentConfirmation", async (req, res: any) => {
  await scbAdapter.paymentConfirmation(req, res);
});

app.get("/Inquiry", async (req: any, res: any) => {
  await scbAdapter.Inquiry(req, res);
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
