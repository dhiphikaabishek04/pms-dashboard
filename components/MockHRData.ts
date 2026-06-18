export type Employee = Record<string, any>;

// Helper function to safely parse numerical values
export const num = (v: any): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
};

// Helper function to calculate percentage
export const pct = (n: number, total: number): string => {
  return total ? ((n / total) * 100).toFixed(1) + "%" : "0%";
};
