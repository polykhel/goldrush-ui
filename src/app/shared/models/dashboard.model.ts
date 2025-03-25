export interface Dashboard {
  openInquiries: number;
  pendingPayments: number;
  todayAppointments: number;
  activeCustomers: number;
  exchangeRates: {
    usdToPhp: number;
    eurToPhp: number;
    gbpToPhp: number;
    sgdToPhp: number;
    hkdToPhp: number;
    jpyToPhp: number;
    lastUpdated: Date;
  };
}
