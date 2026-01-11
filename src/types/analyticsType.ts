export interface IAnalytics {
  totalVoucher: number;
  totalPaid: Number;
  totalDue: Number;
}

export interface IAnalyticsResponse {
  message: string;
  analytics: IAnalytics;
}

export interface IChart {
  price: number;
  day: string;
  month: string;
}

export interface IGetSummaryResponse {
  success: boolean;
  analytics: {
    last30DaysPayments: IChart[];
  };
}
