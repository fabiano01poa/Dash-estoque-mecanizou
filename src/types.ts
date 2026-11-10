export interface SheetRow {
  [key: string]: any;
}

export interface ProcessedRecord {
  id: string;
  originalRow: SheetRow;
  receiveDate: Date | null;
  outputDate: Date | null;
  receiveDateStr: string;
  outputDateStr: string;
  status?: string;
  category?: string;
  addressing?: string; // Endereçamento / Destino / Tipo de saída
  value: number;
  description: string;
  supplier?: string;
  filial?: string;
  locality?: string;
}

export interface DailyMovement {
  date: string;
  receivedCount: number;
  receivedValue: number;
  outputCount: number;
  outputValue: number;
  balanceCount: number;
  balanceValue: number;
  details: ProcessedRecord[];
}

export interface OutputTypeSummary {
  categoryName: string;
  count: number;
  totalValue: number;
}

export interface ReturnSummary {
  totalReturnEntries: number;
  totalReturnOutputs: number;
  returnNetBalance: number;
  returnTrend: { date: string; entries: number; outputs: number; balance: number }[];
  returnRecords: ProcessedRecord[];
  outputTypeBreakdown: OutputTypeSummary[];
}

export interface MatrixColumnData {
  periodKey: string; // e.g. "01/2026" or "2026-01-15"
  label: string;
  monetaryAsset: number;
  pieceQty: number;
  orderItemQty: number;
  receivedValue: number;
  receivedCount: number;
  returnCost: number;
  returnCount: number;
  revendaCost: number;
  revendaCount: number;
  revendaPercent: number;
  sucataCost: number;
  sucataCount: number;
  perdaCost: number;
  perdaCount: number;
  totalOutputCost: number;
  totalOutputCount: number;
  growthMonetary: number;
  growthQty: number;
  growthOrderItem: number;
}

export interface EmailReportSummary {
  statusText: string;
  statusType: 'critical' | 'warning' | 'success';
  currentIndicatorPercent: number;
  targetPercent: number;
  monthReturnedOI: number;
  monthReturnedValue: number;
  dayReturnedOI: number;
  dayReturnedValue: number;
  negotiatingOI: number;
  negotiatingValue: number;
  approvedOI: number;
  approvedValue: number;
  garantiasOI: number;
  garantiasValue: number;
  topSuppliers: { name: string; orderItems: number; value: number }[];
}

export interface ActionPlanItem {
  id: string;
  title: string;
  description: string;
  responsible: string;
  deadline: string;
  status: 'Pendente' | 'Em Andamento' | 'Concluído';
  priority: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
}

export interface EmailConfig {
  recipients: string;
  subject: string;
  scheduleTimes: string[]; // e.g. ["08:00", "14:00", "18:00"]
  frequency: 'Diário' | 'Semanal' | 'A cada 12h' | 'Personalizado';
  includeActionPlan: boolean;
  includeCharts: boolean;
  active: boolean;
}

export interface MetricSummary {
  totalReceived: number;
  totalOutput: number;
  netBalance: number;
  turnoverRate: number;
  avgDailyEntries: number;
  avgDailyOutputs: number;
  netDailyRate: number;
  daysRemainingInMonth: number;
  projectedEndOfMonthStock: number;
  receivedTrend: { date: string; count: number; value: number }[];
  outputTrend: { date: string; count: number; value: number }[];
  combinedTrend: { date: string; received: number; output: number; trend: number }[];
  alerts: AlertItem[];
  filteredRowsCount: number;
}

export interface AlertItem {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  metric: string;
  timestamp: string;
}


