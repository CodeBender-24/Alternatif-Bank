import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

export const formatCurrency = (value, currency = 'TRY', options = {}) => {
  const amount = Number(value || 0);
  return Math.abs(amount).toLocaleString('tr-TR', {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol',
    ...options
  });
};

export const formatDateTime = (value) => {
  return dayjs(value).format('DD MMM YYYY HH:mm');
};
