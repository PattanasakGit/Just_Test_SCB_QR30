import express from "express";
import { SCBAdapter } from "./Adepter";

const app = express();
const PORT = process.env.PORT || 3000;
const scbAdapter = new SCBAdapter();

app.use(express.json());

app.post("/generate-qrcode", async (req, res) => {
  await scbAdapter.generateQRCode(req, res);
});

app.post("/PaymentConfirmation", async (req, res) => {
  await scbAdapter.paymentConfirmation(req, res);
});

app.get("/check-transaction", async (req, res) => {
  await scbAdapter.checkTransaction(req, res);
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
