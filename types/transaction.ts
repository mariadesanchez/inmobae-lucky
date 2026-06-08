export type OperationType = 'venta' | 'alquiler';

export interface PropertyTransaction {
  id: string;
  property_id: string;
  operation_type: OperationType;
  price: number;
  operation_date: string;
  notes?: string;
  created_at?: string;
}

export interface BrokerStats {
  totalProperties: number;
  activeProperties: number;
  inactiveProperties: number;
  totalSales: number;
  totalRents: number;
  revenueSales: number;
  revenueRents: number;
  avgDaysOnMarketSales: number;
  avgDaysOnMarketRents: number;
}
