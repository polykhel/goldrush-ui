export interface FinancialReport {
  period: {
    start: Date;
    end: Date;
  };
  revenue: {
    total: number;
    byPaymentMethod: PaymentMethodRevenue[];
    byPackageType: PackageTypeRevenue[];
    byDestination: DestinationRevenue[];
  };
  serviceFees: {
    total: number;
    byPackageType: PackageTypeServiceFee[];
  };
  taxes: {
    vat: {
      output: number;
      input: number;
      payable: number;
    };
    withholding: {
      total: number;
      byType: WithholdingTax[];
    };
  };
  expenses: {
    total: number;
    byCategory: ExpenseCategory[];
  };
  netIncome: number;
}

export interface PaymentMethodRevenue {
  method: string;
  amount: number;
  percentage: number;
}

export interface PackageTypeRevenue {
  type: string;
  amount: number;
  percentage: number;
}

export interface DestinationRevenue {
  destination: string;
  amount: number;
  percentage: number;
}

export interface PackageTypeServiceFee {
  type: string;
  amount: number;
  percentage: number;
}

export interface WithholdingTax {
  type: string;
  amount: number;
  percentage: number;
}

export interface ExpenseCategory {
  category: string;
  amount: number;
  percentage: number;
}
