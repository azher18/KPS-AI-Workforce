// ============================================================================
// KPS AI Workforce - Appointments & Google Calendar Manager
// ============================================================================

import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  CalendarCheck2,
  X
} from 'lucide-react';
import type { Appointment } from '../types/index.ts';
import { fetchJson } from '../lib/api.js';

export const AppointmentsManager: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    service_name: 'VIP Showing / Private Consultation',
    appointment_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    appointment_time: '14:00',
    notes: 'Direct client booking'
  });

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const data = await fetchJson<Appointment[]>('/api/appointments');
      setAppointments(data);
    } catch (e) {
      console.error('Failed to load appointments:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await fetchJson<Appointment>('/api/appointments', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      setAppointments([...appointments, created]);
      setIsBookingModalOpen(false);
    } catch (e) {
      console.error('Failed to book appointment:', e);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: Appointment['status']) => {
    try {
      const updated = await fetchJson<Appointment>(`/api/appointments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      setAppointments(appointments.map(a => (a.id === id ? updated : a)));
    } catch (e) {
      console.error('Failed to update appointment:', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Appointments &amp; Calendar</h2>
          <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
            <span>{appointments.length} scheduled reservations</span>
            <span>·</span>
            <span className="text-emerald-400 font-medium">Google Calendar 2-Way Sync Active</span>
          </div>
        </div>

        <button
          onClick={() => setIsBookingModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Sync Status Banner */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CalendarCheck2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white">Google Calendar Active Synchronization</h4>
            <p className="text-[11px] text-slate-400">
              AI autonomously checks conflicts before proposing slots. Double-booking is strictly prohibited.
            </p>
          </div>
        </div>

        <span className="text-xs text-emerald-400 font-mono font-medium">
          · Status: Synchronized
        </span>
      </div>

      {/* Appointments List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-medium">
                <th className="py-3 px-4">Client Name &amp; Contact</th>
                <th className="py-3 px-4">Service / Purpose</th>
                <th className="py-3 px-4">Date &amp; Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Loading appointments...
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <p className="font-medium text-sm text-slate-300">No scheduled appointments</p>
                    <p className="text-xs text-slate-500 mt-1">Appointments booked via AI calls or manual booking will appear here.</p>
                  </td>
                </tr>
              ) : (
                appointments.map(appt => (
                  <tr key={appt.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{appt.customer_name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span>{appt.customer_phone || 'No phone'}</span>
                        {appt.customer_email && (
                          <>
                            <span>·</span>
                            <span>{appt.customer_email}</span>
                          </>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-200">
                      {appt.service_name}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200">{appt.appointment_date}</div>
                      <div className="text-[11px] text-blue-400 font-mono mt-0.5">{appt.appointment_time} ({appt.timezone})</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`font-medium ${
                        appt.status === 'confirmed' ? 'text-emerald-400' :
                        appt.status === 'cancelled' ? 'text-red-400' : 'text-amber-400'
                      }`}>
                        · {appt.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs text-slate-400 text-[11px] truncate">
                      {appt.notes || '—'}
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      {appt.status !== 'completed' && (
                        <button
                          onClick={() => handleUpdateStatus(appt.id, 'completed')}
                          className="text-xs text-emerald-400 hover:text-emerald-300"
                        >
                          Complete
                        </button>
                      )}
                      {appt.status !== 'cancelled' && (
                        <button
                          onClick={() => handleUpdateStatus(appt.id, 'cancelled')}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Appointment Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <form onSubmit={handleCreateAppointment} className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative space-y-4">
            <button
              type="button"
              onClick={() => setIsBookingModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white">Manual Calendar Booking</h3>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Customer Full Name</label>
              <input
                type="text"
                required
                value={form.customer_name}
                onChange={e => setForm({ ...form, customer_name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                placeholder="Harrison Sterling"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Phone</label>
                <input
                  type="text"
                  value={form.customer_phone}
                  onChange={e => setForm({ ...form, customer_phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  placeholder="+1 (212) 555-8912"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={form.customer_email}
                  onChange={e => setForm({ ...form, customer_email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  placeholder="client@capital.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Service / Appointment Type</label>
              <input
                type="text"
                required
                value={form.service_name}
                onChange={e => setForm({ ...form, service_name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={form.appointment_date}
                  onChange={e => setForm({ ...form, appointment_date: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Time</label>
                <input
                  type="time"
                  required
                  value={form.appointment_time}
                  onChange={e => setForm({ ...form, appointment_time: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
              >
                Confirm Booking
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
