import { Type } from 'class-transformer';
import { IsInt, IsString, Min } from 'class-validator';

export class GetFinancingOptionsDto {
  @IsString()
  buyerId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  amount: number;
}
