import axios from "axios";
import dotenv from "dotenv";
import { IInquiry } from "./Interface/IInquiry";
import { IBodyGenQR } from "./Interface/IgenerateQRCode";
import { IPaymentConfirmation } from "./Interface/IPaymentConfirmation";

dotenv.config();

export class SCBAdapter {
  private api_key: string;
  private secret_api_key: string;
  private URL: string;
  private headers_const: {};
  constructor() {
    this.api_key = process.env.API_KEY || "";
    this.secret_api_key = process.env.API_SECRET || "";
    this.URL = process.env.URL || "";
    this.headers_const = {
      "Content-Type": "application/json",
      "accept-language": "EN",
      resourceOwnerId: this.api_key,
    };
  }

  async generateQRCode(uuid: string, authCode: unknown, data: IBodyGenQR) {
    try {
      const body: IBodyGenQR = {
        qrType: data.qrType,
        ppType: data.ppType,
        ppId: data.ppId,
        amount: data.amount,
        ref1: data.ref1,
        ref2: data.ref2,
        ref3: data.ref3,
      };
      const headers = {
        ...this.headers_const,
        authorization: `Bearer ${await this.getAccessToken(uuid, authCode)}`,
        requestUId: uuid,
      };
      const qrCodeDataResponse = await axios.post(
        this.URL + "/payment/qrcode/create",
        body,
        { headers }
      );

      const qrCodeData = qrCodeDataResponse.data.data;
      console.log("Generate QR-Code success ✅ ");
      return {
        statusCode: 200,
        data: qrCodeData,
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async paymentConfirmation(paymentData: IPaymentConfirmation) {
    console.log("Payment notification received:", paymentData);
    return {
      statusCode: 200,
      data: {
        resCode: "00",
        resDesc: "success",
        transactionId: paymentData.transactionId,
        confirmId: paymentData.transactionId, //Optional
      },
    };
  }

  async Inquiry(uuid: string, authCode: unknown, data_params_input: IInquiry) {
    const url = this.URL + "/payment/billpayment/inquiry";
    try {
      const headers = {
        ...this.headers_const,
        authorization: `Bearer ${await this.getAccessToken(uuid, authCode)}`,
        requestUID: uuid,
      };

      const params = new URLSearchParams();
      if (data_params_input.eventCode) {
        params.append("eventCode", data_params_input.eventCode);
      }
      if (data_params_input.billerId) {
        params.append("billerId", data_params_input.billerId);
      }
      if (data_params_input.reference1) {
        params.append("reference1", data_params_input.reference1);
      }
      if (data_params_input.transactionDate) {
        params.append("transactionDate", data_params_input.transactionDate);
      }
      if (data_params_input.reference2) {
        params.append("reference2", data_params_input.reference2);
      }
      if (data_params_input.amount) {
        params.append("amount", data_params_input.amount);
      }
      const apiUrl = `${url}?${params.toString()}`;
      const response = await axios.get(apiUrl, { headers });
      return {
        statusCode: 200,
        data: response.data,
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  private async getAccessToken(
    uuid: string,
    authCode: unknown
  ): Promise<string> {
    const body = {
      applicationKey: this.api_key,
      applicationSecret: this.secret_api_key,
      authCode,
    };
    const headers = {
      ...this.headers_const,
      requestUId: uuid,
    };
    const accessTokenResponse = await axios.post(
      this.URL + "/oauth/token",
      body,
      { headers }
    );
    return accessTokenResponse.data.data.accessToken;
  }

  private handleError(error: any): { statusCode: number; data: any } {
    console.error("Response status:", error.response.status);
    console.error("Response data:", error.response.data.status);
    return {
      statusCode: error.response.status,
      data: error.response.data.status,
    };
  }
}
