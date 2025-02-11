import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { ConfigService } from '@nestjs/config';
import {
  Order,
  CreateOrderResponse,
  OrderSimulation,
  OrderSimulationResponse,
} from '../orders/interfaces/order.interface';
import { Buyer } from '../orders/interfaces/buyer.interface';

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

  async simulateOrder(
    request: OrderSimulation,
  ): Promise<OrderSimulationResponse> {
    return (
      await this.http.post<OrderSimulationResponse>(
        `/order-simulation`,
        request,
      )
    ).data;
  }

  async createOrder(request: Order): Promise<CreateOrderResponse> {
    return (await this.http.post<CreateOrderResponse>('/orders', request)).data;
  }
}
