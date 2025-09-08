import { Ticket } from '@/types/ticket';
import { PaymentMethod } from '@/types/payment';

interface SummaryResult {
  paymentTotals: Record<PaymentMethod, number>;
  incomeMap: {
    basicIncome: number;
    ticketBonusIncome: number;
  };
  ticketPaymentMaps: Record<string, Record<PaymentMethod, number>>;
}

export function summarizeTicketPayments(tickets: Ticket[]): SummaryResult {
  const paymentTotals: Record<PaymentMethod, number> = {
    [PaymentMethod.Cash]: 0,
    [PaymentMethod.Card]: 0,
    [PaymentMethod.Treatwell]: 0,
    [PaymentMethod.GiftCard]: 0,
    [PaymentMethod.Others]: 0,
  };

  const incomeMap = {
    basicIncome: 0,
    ticketBonusIncome: 0,
  };

  const ticketPaymentMaps: Record<string, Record<PaymentMethod, number>> = {};

  tickets.forEach((ticket) => {
    const map: Record<PaymentMethod, number> = {
      [PaymentMethod.Cash]: 0,
      [PaymentMethod.Card]: 0,
      [PaymentMethod.Treatwell]: 0,
      [PaymentMethod.GiftCard]: 0,
      [PaymentMethod.Others]: 0,
    };

    ticket.payments.forEach(({ method, amount }) => {
      const key = method.toLowerCase() as PaymentMethod;

      if (Object.values(PaymentMethod).includes(key)) {
        map[key] += amount;
        paymentTotals[key] += amount;
      } else {
        map[PaymentMethod.Others] += amount;
        paymentTotals[PaymentMethod.Others] += amount;
      }
    });

    if (ticket.isBonus) {
      incomeMap.ticketBonusIncome += ticket.bonusAmount;
    } else {
      incomeMap.basicIncome += ticket.totalAmount;
    }

    ticketPaymentMaps[ticket.id] = map;
  });

  return {
    paymentTotals,
    incomeMap,
    ticketPaymentMaps,
  };
}
