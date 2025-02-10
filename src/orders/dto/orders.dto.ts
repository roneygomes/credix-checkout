import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsPhoneNumber,
  IsString,
  Min,
} from 'class-validator';
import { FinancingOption } from '../interfaces/financing.interface';
import {
  ContactInformation,
  Cost,
  Order,
  OrderItem,
  ShippingLocation,
} from '../interfaces/order.interface';
import { v4 as uuidv4 } from 'uuid';

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

export class CheckoutRequestItem {
  @Type(() => Number)
  @IsInt()
  id: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  amount: number;
}

export class CheckoutRequestContactInformation {
  @IsEmail()
  email: string;

  @IsPhoneNumber()
  phone: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  lastName: string;
}

export class CheckoutRequestShippingLocation {
  @IsNotEmpty()
  address1: string;
  address2?: string;

  @IsNotEmpty()
  city: string;

  @IsNotEmpty()
  region: string;

  @IsNumberString()
  postalCode: string;

  @IsNotEmpty()
  country: string;
}

export class CheckoutRequestBody {
  @IsNumberString()
  buyerTaxId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  taxAmountCents: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  shippingCostCents: number;
  shippingLocation: CheckoutRequestShippingLocation;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  subtotalAmountCents: number;

  @IsDateString()
  @Transform(({ value }) => new Date(value))
  estimatedDeliveryDateUTC: Date;

  contactInformation: CheckoutRequestContactInformation;
  items: CheckoutRequestItem[];

  toOrder(): Order {
    const cost: Cost = {
      shippingCostCents: this.shippingCostCents,
      orderCostCents: this.subtotalAmountCents,
      taxCostCents: this.taxAmountCents,
    };

    const shipping: ShippingLocation = {
      address1: this.shippingLocation.address1,
      address2: this.shippingLocation.address2,
      city: this.shippingLocation.city,
      region: this.shippingLocation.region,
      postalCode: this.shippingLocation.postalCode,
      country: this.shippingLocation.country,
    };

    const contact: ContactInformation = {
      email: this.contactInformation.email,
      phone: this.contactInformation.phone,
      name: this.contactInformation.name,
      lastName: this.contactInformation.lastName,
    };

    const items: OrderItem[] = this.items.map(({ id, amount }) => {
      return { id, amount };
    });

    return {
      id: uuidv4(),
      buyerTaxId: this.buyerTaxId,
      deliveryDate: this.estimatedDeliveryDateUTC,
      items,
      cost,
      shipping,
      contact,
    };
  }
}
