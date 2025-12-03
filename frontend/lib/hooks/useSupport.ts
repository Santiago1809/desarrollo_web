"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supportService } from "../services/support.service";
import type {
  CreateSupportTicketRequest,
  UpdateSupportTicketRequest,
  TicketState,
} from "../types/support";

// ==================== QUERIES ====================

export function useMyTickets() {
  return useQuery({
    queryKey: ["support", "my-tickets"],
    queryFn: () => supportService.getMyTickets(),
  });
}

export function useAllTickets(state?: TicketState) {
  return useQuery({
    queryKey: ["support", "all-tickets", state],
    queryFn: () => supportService.getAllTickets(state),
  });
}

export function useTicketStats() {
  return useQuery({
    queryKey: ["support", "stats"],
    queryFn: () => supportService.getTicketStats(),
  });
}

export function useTicketById(ticketId: string | undefined) {
  return useQuery({
    queryKey: ["support", "ticket", ticketId],
    queryFn: () => supportService.getTicketById(ticketId!),
    enabled: !!ticketId,
  });
}

// ==================== MUTATIONS ====================

export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSupportTicketRequest) =>
      supportService.createTicket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support"] });
    },
  });
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ticketId,
      data,
    }: {
      ticketId: string;
      data: UpdateSupportTicketRequest;
    }) => supportService.updateTicket(ticketId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support"] });
    },
  });
}

export function useCloseTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ticketId: string) => supportService.closeTicket(ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support"] });
    },
  });
}

export function useDeleteTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ticketId: string) => supportService.deleteTicket(ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support"] });
    },
  });
}
