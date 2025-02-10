import { Injectable } from '@nestjs/common';
import { GetBuyerResponse } from './interfaces/responses.interface';
import axios, { AxiosInstance } from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CredixClient {
  readonly http: AxiosInstance;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get('CREDIPAY_API_KEY')!;

    this.http = axios.create({
      baseURL: 'https://api.pre.credix.finance/v1/',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-CREDIPAY-API-KEY': apiKey,
      },
    });
  }

  async getBuyer(taxId: string): Promise<GetBuyerResponse> {
    return (await this.http.get<GetBuyerResponse>(`/buyers/${taxId}`)).data;
  }

  // TODO: map request and response
  async createOrder(request: any): Promise<void> {
    return await this.http.post('orders', request);
  }
}
