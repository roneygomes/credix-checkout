import { Transform, Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsISO8601,
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
  Installment,
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

export class CheckoutRequestInstallment {
  @IsNotEmpty()
  maturityDate: string;

  @Min(1)
  faceValueCents: number;
}

export class CheckoutRequestBody {
  @IsNumberString()
  buyerTaxId: string;

  @Min(1)
  taxAmountCents: number;

  @Min(1)
  shippingCostCents: number;

  @Min(1)
  subtotalAmountCents: number;

  items: CheckoutRequestItem[];
  installments: CheckoutRequestInstallment[];

  estimatedDeliveryDateUTC: string;
  contactInformation: CheckoutRequestContactInformation;
  shippingLocation: CheckoutRequestShippingLocation;
}

export function toOrder(body: CheckoutRequestBody): Order {
  const cost: Cost = {
    shippingCostCents: body.shippingCostCents,
    orderCostCents: body.subtotalAmountCents,
    taxCostCents: body.taxAmountCents,
  };

  const shipping: ShippingLocation = {
    address1: body.shippingLocation.address1,
    address2: body.shippingLocation.address2,
    city: body.shippingLocation.city,
    region: body.shippingLocation.region,
    postalCode: body.shippingLocation.postalCode,
    country: body.shippingLocation.country,
  };

  const contact: ContactInformation = {
    email: body.contactInformation.email,
    phone: body.contactInformation.phone,
    name: body.contactInformation.name,
    lastName: body.contactInformation.lastName,
  };

  const items: OrderItem[] = body.items.map(({ id, amount }) => {
    return { id, amount };
  });

  const installments: Installment[] = body.installments.map((i) => {
    return {
      maturityDate: new Date(i.maturityDate),
      faceValueCents: i.faceValueCents,
    };
  });

  return {
    id: uuidv4(),
    buyerTaxId: body.buyerTaxId,
    deliveryDate: new Date(body.estimatedDeliveryDateUTC),
    items,
    installments,
    cost,
    shipping,
    contact,
  };
}
