// src/app.ts
import express, { Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const api_key = process.env.API_KEY;
const secret_api_key = process.env.API_SECRET;

app.use(express.json());

//-------------------------------------------------Create QR CODE Payment-----------------------------------------------
//สร้าง QR CODE
app.post("/generate-qrcode", async (req, res) => {
  const { qrType, ppType, ppId, amount, ref1, ref2, ref3 } = req.body;
  const authCode = req.query.authCode;

  try {
    //ข้อ Token จาก SCB-DEV
    const accessTokenResponse = await axios.post(
      "https://api-sandbox.partners.scb/partners/sandbox/v1/oauth/token",
      {
        applicationKey: api_key,
        applicationSecret: secret_api_key,
        authCode,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "accept-language": "EN",
          requestUId: "1b01dff2-b3a3-4567-adde-cd9dd73c8b6d",
          resourceOwnerId: api_key,
        },
      }
    );

    const accessToken = accessTokenResponse.data.data.accessToken;
    console.log("accessToken ", accessToken);

    // ยิง API เพื่อสร้าง QR CODE --> จะได้รับ ข้อมูลของ QR CODE กลับมา
    const qrCodeDataResponse = await axios.post(
      "https://api-sandbox.partners.scb/partners/sandbox/v1/payment/qrcode/create",
      {
        qrType,
        ppType,
        ppId,
        amount,
        ref1,
        ref2,
        ref3,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "accept-language": "EN",
          authorization: `Bearer ${accessToken}`,
          requestUId: "85230887-e643-4fa4-84b2-4e56709c4ac4",
          resourceOwnerId: api_key,
        },
      }
    );
    const qrCodeData = qrCodeDataResponse.data.data;

    res.status(200).json({
      qrCodeData,
    });
  } catch (error: any) {
    console.error("Error generating QR code:", error);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    res.status(500).send(error);
  }
});
//----------------------------------------------------------------------------------------------------------------------

//----------------------------------------เพื่อรับ respont เมื่อกาชำระเงินเสร็จสิ้น-----------------------------------------------

app.post("/PaymentConfirmation", async (req, res) => {
  const paymentData = req.body;
  console.log("Payment notification received:", paymentData);
  res.status(200).json({
    resCode: "00",
    resDesc: "success",
    transactionId: "xxx",
    confirmId: "xxx",
  });
});
//----------------------------------------------------------------------------------------------------------------------

//---------------------------------------   inquiry  Check data --------------------------------------------------------

app.get("/check-transaction", async (req, res) => {
  const authCode = req.query.authCode;

  const url =
    "https://api-sandbox.partners.scb/partners/sandbox/v1/payment/billpayment/inquiry";

  const {
    billerId,
    reference1,
    reference2,
    transactionDate,
    eventCode,
    partnerTransactionId,
    amount,
  } = req.query;

  try {
    const accessTokenResponse = await axios.post(
      "https://api-sandbox.partners.scb/partners/sandbox/v1/oauth/token",
      {
        applicationKey: api_key,
        applicationSecret: secret_api_key,
        authCode,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "accept-language": "EN",
          requestUId: "1b01dff2-b3a3-4567-adde-cd9dd73c8b6d",
          resourceOwnerId: api_key,
        },
      }
    );

    const accessToken = accessTokenResponse.data.data.accessToken;

    const headers = {
      authorization: `Bearer ${accessToken}`,
      requestUID: "a105508e-63fb-4890-a4a5-2278ed1009a0",
      resourceOwnerID: "L78C4D65AB053A428AAA1BD6BEDA9D2575",
      "accept-language": "EN",
    };

    const apiUrl =
      `${url}?eventCode=${eventCode}&billerId=${billerId}&reference1=${reference1}&transactionDate=${transactionDate}` +
      (reference2 ? `&reference2=${reference2}` : "") +
      (partnerTransactionId
        ? `&partnerTransactionId=${partnerTransactionId}`
        : "") +
      (amount ? `&amount=${amount}` : "");

    const response = await axios.get(apiUrl, { headers });

    console.log(response.data);
    res.status(200).json(response.data);
  } catch (error: any) {
    console.error("Error:", error);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
      res.status(500).json(error.response.data);
    }
  }
});
//----------------------------------------------------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
