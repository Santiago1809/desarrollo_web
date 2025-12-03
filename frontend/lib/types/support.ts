// Support Ticket Types
export type TicketState = "open" | "in_progress" | "closed";

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  state: TicketState;
  adminResponse?: string;
  reportDate: string;
  resolvedAt?: string;
  usuario?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateSupportTicketRequest {
  description: string;
  subject?: string;
}

export interface UpdateSupportTicketRequest {
  state?: TicketState;
  adminResponse?: string;
}

export interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  closed: number;
}
