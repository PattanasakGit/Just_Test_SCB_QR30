import axios from "axios";
import dotenv from "dotenv";
import { Request, Response } from "express";

dotenv.config();

export class SCBAdapter {
  private api_key: string;
  private secret_api_key: string;

  constructor() {
    this.api_key = process.env.API_KEY || "";
    this.secret_api_key = process.env.API_SECRET || "";
  }

  async generateQRCode(req: Request, res: Response) {
    const { qrType, ppType, ppId, amount, ref1, ref2, ref3 } = req.body;
    const authCode: any = req.query.authCode;

    try {
      const accessToken = await this.getAccessToken(authCode);

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
        this.getRequestConfig(accessToken)
      );

      const qrCodeData = qrCodeDataResponse.data.data;
      const qrCodeImg = qrCodeDataResponse.data.data.qrImage;

      res.status(200).send(qrCodeImg);
      // res.status(200).json({
      //   qrCodeData,
      // });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  async paymentConfirmation(req: Request, res: Response) {
    const paymentData = req.body;
    console.log("Payment notification received:", paymentData);
    res.status(200).json({
      resCode: "00",
      resDesc: "success",
      transactionId: "xxx",
      confirmId: "xxx",
    });
  }

  async checkTransaction(req: Request, res: Response) {
    const authCode: any = req.query.authCode;
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
      const accessToken = await this.getAccessToken(authCode);

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
      this.handleError(error, res);
    }
  }

  private async getAccessToken(authCode: string | undefined): Promise<string> {
    const accessTokenResponse = await axios.post(
      "https://api-sandbox.partners.scb/partners/sandbox/v1/oauth/token",
      {
        applicationKey: this.api_key,
        applicationSecret: this.secret_api_key,
        authCode,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "accept-language": "EN",
          requestUId: "1b01dff2-b3a3-4567-adde-cd9dd73c8b6d",
          resourceOwnerId: this.api_key,
        },
      }
    );

    return accessTokenResponse.data.data.accessToken;
  }

  private getRequestConfig(accessToken: string): any {
    return {
      headers: {
        "Content-Type": "application/json",
        "accept-language": "EN",
        authorization: `Bearer ${accessToken}`,
        requestUId: "85230887-e643-4fa4-84b2-4e56709c4ac4",
        resourceOwnerId: this.api_key,
      },
    };
  }

  private handleError(error: any, res: Response): void {
    console.error("Error:", error);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
      res.status(500).json(error.response.data);
    }
  }
}