import { PaymentMethod } from './payment';

export type PaymentAmounts = {
  [PaymentMethod.Cash]: string;
  [PaymentMethod.Card]: string;
  [PaymentMethod.Treatwell]: string;
  [PaymentMethod.GiftCard]: string;
  [PaymentMethod.Others]: {
    label: string;
    amount: string;
  };
};
