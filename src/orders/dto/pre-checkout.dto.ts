import { Type } from 'class-transformer';
import { IsInt, IsString, Min } from 'class-validator';
import { FinancingOption } from '../interfaces/financing.interface';

export class GetFinancingOptionsQueryParams {
  @IsString()
  buyerId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  amount: number;
}

export class GetFinancingOptionsResponse {
  financingOptions: FinancingOption[];
}

export class PreCheckoutQueryParams {
  @IsString()
  buyerId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  amount: number;
}

export class PreCheckoutResponse {
  financingOptions: FinancingOption[];
}
