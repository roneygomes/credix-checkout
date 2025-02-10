import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { ConfigService } from '@nestjs/config';
import { Order } from './interfaces/order.interface';
import { Buyer } from './interfaces/buyer.interface';
import { CreateOrderResponse } from './dto/order.dto';

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

  async getBuyer(taxId: string): Promise<Buyer> {
    return (await this.http.get<Buyer>(`/buyers/${taxId}`)).data;
  }

  async createOrder(request: Order): Promise<CreateOrderResponse> {
    return (await this.http.post<CreateOrderResponse>('/orders', request)).data;
  }
}
