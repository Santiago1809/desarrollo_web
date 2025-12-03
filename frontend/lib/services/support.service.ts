import { api } from "../api";
import type {
  SupportTicket,
  CreateSupportTicketRequest,
  UpdateSupportTicketRequest,
  TicketStats,
  TicketState,
} from "../types/support";

export const supportService = {
  // Create a new support ticket
  createTicket: async (
    data: CreateSupportTicketRequest
  ): Promise<SupportTicket> => {
    const response = await api.post<SupportTicket>("/support", data);
    return response.data;
  },

  // Get my tickets
  getMyTickets: async (): Promise<SupportTicket[]> => {
    const response = await api.get<SupportTicket[]>("/support/my-tickets");
    return response.data;
  },

  // Get all tickets (admin only)
  getAllTickets: async (state?: TicketState): Promise<SupportTicket[]> => {
    const params = state ? `?state=${state}` : "";
    const response = await api.get<SupportTicket[]>(`/support/all${params}`);
    return response.data;
  },

  // Get ticket stats (admin only)
  getTicketStats: async (): Promise<TicketStats> => {
    const response = await api.get<TicketStats>("/support/stats");
    return response.data;
  },

  // Get a single ticket
  getTicketById: async (ticketId: string): Promise<SupportTicket> => {
    const response = await api.get<SupportTicket>(`/support/${ticketId}`);
    return response.data;
  },

  // Update a ticket (admin only)
  updateTicket: async (
    ticketId: string,
    data: UpdateSupportTicketRequest
  ): Promise<SupportTicket> => {
    const response = await api.patch<SupportTicket>(
      `/support/${ticketId}`,
      data
    );
    return response.data;
  },

  // Close a ticket
  closeTicket: async (ticketId: string): Promise<SupportTicket> => {
    const response = await api.patch<SupportTicket>(
      `/support/${ticketId}/close`
    );
    return response.data;
  },

  // Delete a ticket (admin only)
  deleteTicket: async (ticketId: string): Promise<void> => {
    await api.delete(`/support/${ticketId}`);
  },
};
