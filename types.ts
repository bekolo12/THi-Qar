
export interface Entry {
  id: number;
  city: string;
  ring: string;
  workType: string;
  fdt: string;
  activity: string;
  primaryBoq?: number | string;
  boq: number | string;
  completed: number | string;
  remaining: number | string;
  date: string;
  notes: string;
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}
