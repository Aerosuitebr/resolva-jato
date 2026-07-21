export type AgendaEventStatus = 'confirmed' | 'tentative' | 'done';
export type AgendaEventPriority = 'normal' | 'high' | 'critical';

export interface AgendaEvent {
  id: string;
  title: string;
  client: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  notes: string;
  alertMinutes: number;
  priority: AgendaEventPriority;
  status: AgendaEventStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AgendaHoliday {
  date: string;
  name: string;
  type: 'national' | 'optional';
}
