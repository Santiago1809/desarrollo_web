"use client";

import { useState, useEffect } from "react";
import { useAuthContext } from "@/app/contexts/AuthContext";
import {
  useBarberSchedule,
  useAddBarberSchedule,
  useDeactivateBarberSchedule,
  useBarberDateSchedules,
  useSetBarberDateSchedule,
  useDeleteBarberDateSchedule,
} from "@/lib/hooks/useAppointments";
import { USER_ROLES } from "@/lib/types/appointments";
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Loader2,
  ChevronLeft,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";

/**
 * Parses a date string safely to avoid timezone issues
 * Handles both "YYYY-MM-DD" and ISO date formats
 */
function parseDate(dateStr: string): Date {
  // If it's a full ISO string, extract just the date part
  const datePart = dateStr.split("T")[0];
  const [year, month, day] = datePart.split("-").map(Number);
  // Create date at noon local time to avoid timezone shifts
  return new Date(year, month - 1, day, 12, 0, 0);
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
];

export default function HorariosPage() {
  const { user, isLoading: isAuthLoading } = useAuthContext();
  const router = useRouter();

  // Form state for weekly schedule
  const [newSchedule, setNewSchedule] = useState({
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "18:00",
  });

  // Form state for date-specific schedule
  const [newDateSchedule, setNewDateSchedule] = useState({
    date: "",
    isWorkDay: false,
    note: "",
  });

  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [showAddDateSchedule, setShowAddDateSchedule] = useState(false);

  // Queries and mutations
  const { data: schedules, isLoading: schedulesLoading } = useBarberSchedule(
    user?.id
  );
  const { data: dateSchedules, isLoading: dateSchedulesLoading } =
    useBarberDateSchedules(user?.id);

  const addSchedule = useAddBarberSchedule();
  const deactivateSchedule = useDeactivateBarberSchedule();
  const setDateSchedule = useSetBarberDateSchedule();
  const deleteDateSchedule = useDeleteBarberDateSchedule();

  // Redirect if not barber
  useEffect(() => {
    if (!isAuthLoading && (!user || user.role !== USER_ROLES.BARBER)) {
      router.push("/citas");
    }
  }, [user, isAuthLoading, router]);

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addSchedule.mutateAsync(newSchedule);
      setShowAddSchedule(false);
      setNewSchedule({ dayOfWeek: 1, startTime: "09:00", endTime: "18:00" });
    } catch (error) {
      console.error("Error adding schedule:", error);
    }
  };

  const handleAddDateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDateSchedule.mutateAsync({
        date: newDateSchedule.date,
        isWorkDay: newDateSchedule.isWorkDay,
        note: newDateSchedule.note || undefined,
      });
      setShowAddDateSchedule(false);
      setNewDateSchedule({ date: "", isWorkDay: false, note: "" });
    } catch (error) {
      console.error("Error setting date schedule:", error);
    }
  };

  // Render schedule list (to avoid nested ternary)
  const renderScheduleList = () => {
    if (schedulesLoading) {
      return (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
        </div>
      );
    }

    if (schedules && schedules.length > 0) {
      const activeSchedules = schedules
        .filter((s) => s.isActive)
        .sort((a, b) => a.dayOfWeek - b.dayOfWeek);

      if (activeSchedules.length > 0) {
        return (
          <div className="space-y-3">
            {activeSchedules.map((schedule) => (
              <div
                key={schedule.id}
                className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg"
              >
                <div>
                  <p className="font-medium text-zinc-900 dark:text-white">
                    {
                      DAYS_OF_WEEK.find((d) => d.value === schedule.dayOfWeek)
                        ?.label
                    }
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {schedule.startTime} - {schedule.endTime}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => deactivateSchedule.mutate(schedule.id)}
                  disabled={deactivateSchedule.isPending}
                  className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        );
      }
    }

    return (
      <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
        <p>No tienes horarios configurados</p>
        <p className="text-sm">Agrega tu disponibilidad semanal</p>
      </div>
    );
  };

  // Render date schedule list (to avoid nested ternary)
  const renderDateScheduleList = () => {
    if (dateSchedulesLoading) {
      return (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
        </div>
      );
    }

    if (dateSchedules && dateSchedules.length > 0) {
      return (
        <div className="space-y-3">
          {dateSchedules.map((schedule) => (
            <div
              key={schedule.id}
              className={`flex items-center justify-between p-4 rounded-lg ${
                schedule.isWorkDay
                  ? "bg-green-50 dark:bg-green-900/20"
                  : "bg-red-50 dark:bg-red-900/20"
              }`}
            >
              <div>
                <p className="font-medium text-zinc-900 dark:text-white">
                  {parseDate(schedule.date).toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {schedule.isWorkDay ? "Día laboral" : "Día libre"}
                  {schedule.note && ` - ${schedule.note}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => deleteDateSchedule.mutate(schedule.id)}
                disabled={deleteDateSchedule.isPending}
                className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
        <Calendar className="h-8 w-8 mx-auto mb-2" />
        <p>No tienes días especiales configurados</p>
      </div>
    );
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!user || user.role !== USER_ROLES.BARBER) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/citas"
            className="inline-flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            Volver a mis citas
          </Link>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            Gestionar horarios
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Configura tu disponibilidad semanal y días especiales
          </p>
        </div>

        {/* Weekly Schedule Section */}
        <section className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-amber-500" />
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                Horario semanal
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowAddSchedule(!showAddSchedule)}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Agregar
            </button>
          </div>

          {/* Add schedule form */}
          {showAddSchedule && (
            <form
              onSubmit={handleAddSchedule}
              className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label
                    htmlFor="dayOfWeek"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
                  >
                    Día
                  </label>
                  <select
                    id="dayOfWeek"
                    value={newSchedule.dayOfWeek}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        dayOfWeek: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  >
                    {DAYS_OF_WEEK.map((day) => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="startTime"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
                  >
                    Hora inicio
                  </label>
                  <input
                    id="startTime"
                    type="time"
                    value={newSchedule.startTime}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        startTime: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="endTime"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
                  >
                    Hora fin
                  </label>
                  <input
                    id="endTime"
                    type="time"
                    value={newSchedule.endTime}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        endTime: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={addSchedule.isPending}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:bg-amber-400 transition-colors"
                >
                  {addSchedule.isPending ? "Guardando..." : "Guardar"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddSchedule(false)}
                  className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {/* Schedule list */}
          {renderScheduleList()}
        </section>

        {/* Date-specific Schedule Section */}
        <section className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-amber-500" />
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                Días especiales
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowAddDateSchedule(!showAddDateSchedule)}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Agregar
            </button>
          </div>

          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
            Marca días libres, vacaciones o días con horario especial
          </p>

          {/* Add date schedule form */}
          {showAddDateSchedule && (
            <form
              onSubmit={handleAddDateSchedule}
              className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    htmlFor="scheduleDate"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
                  >
                    Fecha
                  </label>
                  <input
                    id="scheduleDate"
                    type="date"
                    value={newDateSchedule.date}
                    onChange={(e) =>
                      setNewDateSchedule({
                        ...newDateSchedule,
                        date: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="scheduleNote"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
                  >
                    Nota (opcional)
                  </label>
                  <input
                    id="scheduleNote"
                    type="text"
                    value={newDateSchedule.note}
                    onChange={(e) =>
                      setNewDateSchedule({
                        ...newDateSchedule,
                        note: e.target.value,
                      })
                    }
                    placeholder="Ej: Vacaciones, cita médica..."
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id="isWorkDay"
                  checked={newDateSchedule.isWorkDay}
                  onChange={(e) =>
                    setNewDateSchedule({
                      ...newDateSchedule,
                      isWorkDay: e.target.checked,
                    })
                  }
                  className="rounded border-zinc-300 dark:border-zinc-700 text-amber-500 focus:ring-amber-500"
                />
                <label
                  htmlFor="isWorkDay"
                  className="text-sm text-zinc-700 dark:text-zinc-300"
                >
                  Es día laboral (marca si trabajas este día)
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={setDateSchedule.isPending}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:bg-amber-400 transition-colors"
                >
                  {setDateSchedule.isPending ? "Guardando..." : "Guardar"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddDateSchedule(false)}
                  className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {/* Date schedules list */}
          {renderDateScheduleList()}
        </section>
      </main>
    </div>
  );
}
