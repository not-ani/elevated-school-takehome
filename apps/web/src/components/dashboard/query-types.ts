export type DashboardKpis = {
  totalRevenue: number;
  activeCustomers: number;
  multiDraftRate: number;
  avgRating: number;
  ePlusRate: number;
  onTimeRate: number;
  unassignedCount: number;
  lostRevenue: number;
};

export type OverviewData = {
  kpis: DashboardKpis;
  lateCount: number;
  series: {
    revenueOverTime: Array<{ date: string; value: number }>;
    volumeOverTime: Array<{ date: string; value: number }>;
  };
  breakdowns: {
    byChannel: Array<{ label: string; value: number }>;
  };
  ratings: {
    byDraft: Array<{ draft: number; avgRating: number }>;
  };
  tables: {
    unassignedEssays: Array<{
      item_id: string;
      student_id: string;
      word_count: number;
      turnaround: string;
      revenue: number;
    }>;
    lateDeliveries: Array<{
      item_id: string;
      student_id: string;
      time_remaining_hours: number;
    }>;
  };
};

export type RevenueData = {
  kpis: DashboardKpis;
  series: {
    revenueOverTime: Array<{ date: string; value: number }>;
    volumeOverTime: Array<{ date: string; value: number }>;
  };
  breakdowns: {
    byTurnaround: Array<{ label: string; value: number }>;
    byChannel: Array<{ label: string; value: number }>;
  };
};

export type CustomersData = {
  kpis: DashboardKpis;
  breakdowns: {
    byLocation: Array<{ label: string; value: number }>;
  };
  tables: {
    channelPerformance: Array<{
      channel: string;
      customers: number;
      revenue: number;
      multiDraftRate: number;
      avgLtv: number;
    }>;
  };
};

export type QualityData = {
  kpis: DashboardKpis;
  ratings: {
    byDraft: Array<{ draft: number; avgRating: number }>;
    satisfactionByDraft: Array<{
      draft: number;
      ePlus: number;
      e: number;
      eMinus: number;
    }>;
  };
};

export type OperationsSummaryData = {
  kpis: DashboardKpis;
  lateCount: number;
  breakdowns: {
    byStatus: Array<{ label: string; value: number }>;
  };
};

export type UnassignedEssay = {
  item_id: string;
  student_id: string;
  word_count: number;
  turnaround: string;
  revenue: number;
};

export type LateDelivery = {
  item_id: string;
  student_id: string;
  time_remaining_hours: number;
};
