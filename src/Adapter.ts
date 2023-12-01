import axios from "axios";
import dotenv from "dotenv";
import {
  IBodyGenQR,
  IBodyGenQRRequest,
  IBodyGenQRResponse,
} from "./Interface/IgenerateQRCode";
import {
  IPaymentConfirmationRequest,
  IPaymentConfirmationResponse,
} from "./Interface/IPaymentConfirmation";
import { IInquiryRequest, IInquiryResponse } from "./Interface/IInquiry";

import * as uuid from "uuid";
const params = new URLSearchParams();

dotenv.config();

export class SCBAdapter {
  private api_key: string;
  private secret_api_key: string;
  private U_ID: string;
  private URL: string;
  constructor() {
    this.api_key = process.env.API_KEY || "";
    this.secret_api_key = process.env.API_SECRET || "";
    this.URL = process.env.URL || "";
    this.U_ID = uuid.v4();
  }

  async generateQRCode(req: IBodyGenQRRequest, res: IBodyGenQRResponse) {
    const { qrType, ppType, ppId, amount, ref1, ref2, ref3 } = req.body;
    const authCode: any = req.query.authCode;
    try {
      const accessToken = await this.getAccessToken(authCode);
      const body: IBodyGenQR = {
        qrType,
        ppType,
        ppId,
        amount,
        ref1,
        ref2,
        ref3,
      };
      const headers = {
        "Content-Type": "application/json",
        "accept-language": "EN",
        authorization: `Bearer ${accessToken}`,
        requestUId: this.U_ID,
        resourceOwnerId: this.api_key,
      };
      const qrCodeDataResponse = await axios.post(
        this.URL + "/payment/qrcode/create",
        body,
        { headers }
      );

      const qrCodeData = qrCodeDataResponse.data.data;
      // const qrCodeImg = qrCodeDataResponse.data.data.qrImage;

      // res.status(200).send(qrCodeImg);
      console.log("Generate QR-Code ✅ ");

      res.status(200).json({
        qrCodeData,
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  async paymentConfirmation(
    req: IPaymentConfirmationRequest,
    res: IPaymentConfirmationResponse
  ) {
    const paymentData = req.body;
    console.log("Payment notification received:", paymentData);
    res.status(200).json({
      resCode: "00",
      resDesc: "success",
      transactionId: "xxx",
      confirmId: "xxx",
    });
  }

  async Inquiry(req: IInquiryRequest, res: IInquiryResponse) {
    const url = this.URL + "/payment/billpayment/inquiry";
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
      const accessToken = await this.getAccessToken(req.query.authCode);
      const headers = {
        authorization: `Bearer ${accessToken}`,
        requestUID: this.U_ID,
        resourceOwnerID: this.api_key,
        "accept-language": "EN",
      };
      const params = new URLSearchParams({
        eventCode,
        billerId,
        reference1,
        transactionDate,
        reference2: reference2 || "",
        partnerTransactionId: partnerTransactionId || "",
        amount: amount || "",
      });
      const apiUrl = `${url}?${params.toString()}`;
      const response = await axios.get(apiUrl, { headers });

      console.log(response.data);
      res.status(200).json(response.data);
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  private async getAccessToken(authCode: string | undefined): Promise<string> {
    const body = {
      applicationKey: this.api_key,
      applicationSecret: this.secret_api_key,
      authCode,
    };
    const headers = {
      "Content-Type": "application/json",
      "accept-language": "EN",
      requestUId: this.U_ID,
      resourceOwnerId: this.api_key,
    };
    const accessTokenResponse = await axios.post(
      this.URL + "/oauth/token",
      body,
      { headers }
    );

    return accessTokenResponse.data.data.accessToken;
  }

  private handleError(error: any, res: any): void {
    console.error("Error:", error);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
      res.status(500).json(error.response.data);
    }
  }
}
