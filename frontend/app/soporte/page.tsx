"use client";

import { useState } from "react";
import { useAuthContext } from "@/app/contexts/AuthContext";
import {
  useMyTickets,
  useCreateTicket,
  useUpdateTicket,
  useDeleteTicket,
} from "@/lib/hooks/useSupport";
import type {
  SupportTicket,
  CreateSupportTicketRequest,
} from "@/lib/types/support";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  MessageCircle,
  Plus,
  X,
  Loader2,
  HelpCircle,
  Send,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Link from "next/link";

export default function SoportePage() {
  const { user, isLoading: authLoading } = useAuthContext();
  const isAuthenticated = !!user;
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null
  );
  const [newTicket, setNewTicket] = useState<CreateSupportTicketRequest>({
    subject: "",
    description: "",
  });

  const { data: tickets, isLoading: ticketsLoading } = useMyTickets();
  const createTicketMutation = useCreateTicket();
  const updateTicketMutation = useUpdateTicket();
  const deleteTicketMutation = useDeleteTicket();

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.subject?.trim() || !newTicket.description.trim()) return;

    try {
      await createTicketMutation.mutateAsync(newTicket);
      setNewTicket({ subject: "", description: "" });
      setShowNewTicketForm(false);
    } catch (error) {
      console.error("Error al crear ticket:", error);
    }
  };

  const handleCloseTicket = async (ticketId: string) => {
    if (!confirm("¿Estás seguro de que deseas cerrar este ticket?")) return;

    try {
      await updateTicketMutation.mutateAsync({
        ticketId,
        data: { state: "closed" },
      });
      setSelectedTicket(null);
    } catch (error) {
      console.error("Error al cerrar ticket:", error);
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este ticket?")) return;

    try {
      await deleteTicketMutation.mutateAsync(ticketId);
      setSelectedTicket(null);
    } catch (error) {
      console.error("Error al eliminar ticket:", error);
    }
  };

  const getStatusBadge = (state: SupportTicket["state"]) => {
    const config: Record<
      string,
      { color: string; label: string; icon: React.ReactNode }
    > = {
      open: {
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        label: "Abierto",
        icon: <AlertCircle className="h-3 w-3" />,
      },
      in_progress: {
        color:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        label: "En progreso",
        icon: <Clock className="h-3 w-3" />,
      },
      closed: {
        color:
          "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400",
        label: "Cerrado",
        icon: <CheckCircle className="h-3 w-3" />,
      },
    };
    const { color, label, icon } = config[state] || config.open;
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${color}`}
      >
        {icon}
        {label}
      </span>
    );
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <div className="text-center bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-8 max-w-md">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full w-fit mx-auto mb-4">
              <HelpCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
              Acceso Restringido
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6">
              Debes iniciar sesión para acceder al centro de soporte.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
              Centro de Soporte
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              ¿Tienes alguna pregunta o problema? Estamos aquí para ayudarte.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowNewTicketForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nuevo Ticket
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de tickets */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-4">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-amber-500" />
                Mis Tickets
              </h2>

              {ticketsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
                </div>
              ) : tickets && tickets.length > 0 ? (
                <div className="space-y-3">
                  {tickets.map((ticket) => (
                    <button
                      type="button"
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`w-full text-left p-3 rounded-lg border cursor-pointer transition ${
                        selectedTicket?.id === ticket.id
                          ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
                          : "border-zinc-200 dark:border-zinc-800 hover:border-amber-300 dark:hover:border-amber-700"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-zinc-900 dark:text-white truncate flex-1 pr-2">
                          {ticket.subject}
                        </h3>
                        {getStatusBadge(ticket.state)}
                      </div>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">
                        {ticket.description}
                      </p>
                      <div className="flex justify-end items-center mt-2">
                        <span className="text-xs text-zinc-400 dark:text-zinc-500">
                          {format(new Date(ticket.reportDate), "dd MMM", {
                            locale: es,
                          })}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
                  <p className="text-zinc-500 dark:text-zinc-400">
                    No tienes tickets aún
                  </p>
                  <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">
                    Crea uno nuevo si necesitas ayuda
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Detalle del ticket o formulario */}
          <div className="lg:col-span-2">
            {showNewTicketForm ? (
              <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Plus className="h-5 w-5 text-amber-500" />
                    Crear Nuevo Ticket
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowNewTicketForm(false)}
                    className="p-2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateTicket} className="space-y-4">
                  <div>
                    <label
                      htmlFor="ticket-subject"
                      className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
                    >
                      Asunto
                    </label>
                    <input
                      id="ticket-subject"
                      type="text"
                      value={newTicket.subject}
                      onChange={(e) =>
                        setNewTicket({ ...newTicket, subject: e.target.value })
                      }
                      placeholder="¿En qué podemos ayudarte?"
                      className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="ticket-description"
                      className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
                    >
                      Descripción
                    </label>
                    <textarea
                      id="ticket-description"
                      value={newTicket.description}
                      onChange={(e) =>
                        setNewTicket({
                          ...newTicket,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe tu problema o pregunta con el mayor detalle posible..."
                      rows={6}
                      className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 resize-none"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowNewTicketForm(false)}
                      className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={createTicketMutation.isPending}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {createTicketMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Enviar Ticket
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : selectedTicket ? (
              <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                      {selectedTicket.subject}
                    </h2>
                    <div className="flex gap-2 mt-2">
                      {getStatusBadge(selectedTicket.state)}
                    </div>
                  </div>
                  <span className="text-sm text-zinc-400 dark:text-zinc-500">
                    {format(
                      new Date(selectedTicket.reportDate),
                      "dd MMM yyyy, HH:mm",
                      { locale: es }
                    )}
                  </span>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                    Tu mensaje:
                  </h3>
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4">
                    <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                      {selectedTicket.description}
                    </p>
                  </div>
                </div>

                {selectedTicket.adminResponse && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                      Respuesta del equipo:
                    </h3>
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg p-4">
                      <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                        {selectedTicket.adminResponse}
                      </p>
                    </div>
                  </div>
                )}

                {selectedTicket.resolvedAt && (
                  <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-4 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    Resuelto:{" "}
                    {format(
                      new Date(selectedTicket.resolvedAt),
                      "dd MMM yyyy, HH:mm",
                      { locale: es }
                    )}
                  </p>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  {selectedTicket.state !== "closed" && (
                    <button
                      type="button"
                      onClick={() => handleCloseTicket(selectedTicket.id)}
                      disabled={updateTicketMutation.isPending}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Cerrar Ticket
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteTicket(selectedTicket.id)}
                    disabled={deleteTicketMutation.isPending}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col items-center justify-center h-full min-h-[400px]">
                <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-full mb-4">
                  <HelpCircle className="h-12 w-12 text-zinc-400 dark:text-zinc-500" />
                </div>
                <h3 className="text-lg font-medium text-zinc-600 dark:text-zinc-400 mb-2">
                  Selecciona un ticket
                </h3>
                <p className="text-zinc-400 dark:text-zinc-500 text-center max-w-sm">
                  Selecciona un ticket de la lista para ver los detalles o crea
                  uno nuevo si necesitas ayuda.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
            Preguntas Frecuentes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-4 hover:shadow-md transition-shadow">
              <h3 className="font-medium text-zinc-900 dark:text-white mb-2">
                ¿Cómo puedo cancelar mi cita?
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                Puedes cancelar tu cita desde la sección &quot;Mis Citas&quot;. Solo haz
                clic en la cita que deseas cancelar y selecciona la opción
                &quot;Cancelar&quot;.
              </p>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-4 hover:shadow-md transition-shadow">
              <h3 className="font-medium text-zinc-900 dark:text-white mb-2">
                ¿Puedo reprogramar mi cita?
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                Sí, puedes reprogramar tu cita siempre que sea antes de la hora
                programada. Ve a &quot;Mis Citas&quot; y usa la opción de reprogramar.
              </p>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-4 hover:shadow-md transition-shadow">
              <h3 className="font-medium text-zinc-900 dark:text-white mb-2">
                ¿Cómo califico a un barbero?
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                Después de que tu cita se marque como completada, podrás
                calificar el servicio desde la sección &quot;Mis Citas&quot;.
              </p>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-4 hover:shadow-md transition-shadow">
              <h3 className="font-medium text-zinc-900 dark:text-white mb-2">
                ¿Cuánto tiempo tardan en responder?
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                Nuestro equipo de soporte responde generalmente dentro de las 24
                horas hábiles.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
