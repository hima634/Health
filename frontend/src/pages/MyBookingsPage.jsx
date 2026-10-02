import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingsService, paymentsService } from '../api/services';
import StatusBadge from '../components/StatusBadge';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingsService.getUserBookings();
      setBookings(res.data || []);
    } catch (err) {
      setMessage({ text: err.message || 'Failed to fetch bookings', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      setActionLoading(true);
      await bookingsService.cancel(id);
      setMessage({ text: 'Booking cancelled successfully', type: 'success' });
      fetchBookings();
    } catch (err) {
      setMessage({ text: err.message || 'Failed to cancel booking', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDirectPayment = async (bookingId, simulateSuccess) => {
    try {
      setActionLoading(true);
      const res = await paymentsService.simulate({
        bookingId,
        simulateSuccess
      });

      setMessage({
        text: res.message || 'Payment status updated!',
        type: simulateSuccess ? 'success' : 'error'
      });
      setSelectedBookingForPayment(null);
      fetchBookings();
    } catch (err) {
      setMessage({ text: err.message || 'Payment simulation failed', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Appointment Bookings
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Track diagnostic reservations, manage appointments, and simulate payments.
          </p>
        </div>
        <Link
          to="/"
          className="self-start sm:self-auto px-4 py-2 text-sm font-bold rounded-lg text-white bg-sky-600 hover:bg-sky-700 transition shadow"
        >
          + Book New Appointment
        </Link>
      </div>

      {message.text && (
        <div
          className={`mb-6 p-4 rounded-xl text-sm border ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-slate-500 text-sm font-medium">
          Loading your appointments...
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <div className="text-3xl mb-2">📋</div>
          <h2 className="text-lg font-bold text-slate-900">No Appointments Scheduled Yet</h2>
          <p className="text-slate-500 text-sm mt-1 mb-6">
            Pick a diagnostic centre and test from the home page to schedule your first appointment.
          </p>
          <Link
            to="/"
            className="inline-block py-2.5 px-6 text-sm font-bold text-white bg-sky-600 rounded-xl hover:bg-sky-700 shadow transition"
          >
            Go to Booking Page
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const displayId = booking.bookingId || `#${booking._id.slice(-6).toUpperCase()}`;
            return (
              <div
                key={booking._id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md border border-slate-200">
                      {displayId}
                    </span>
                    <StatusBadge status={booking.status} />
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {booking.test?.name || booking.testName || 'Diagnostic Test'}
                  </h3>

                  <div className="text-xs text-slate-600 mt-1 space-y-0.5">
                    <div>
                      🏢 <strong>Centre:</strong> {booking.centre?.name || booking.centreName || 'Diagnostic Lab'}
                    </div>
                    <div>
                      👤 <strong>Patient:</strong> {booking.patientName} ({booking.patientPhone})
                    </div>
                    <div>
                      📅 <strong>Schedule:</strong> {new Date(booking.appointmentDate).toLocaleDateString()} at {booking.appointmentTime}
                    </div>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-end justify-between md:justify-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-left md:text-right">
                    <div className="text-[11px] text-slate-400">Total Fee</div>
                    <div className="text-xl font-extrabold text-slate-900">₹{booking.amount}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    {booking.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => setSelectedBookingForPayment(booking)}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow transition"
                          disabled={actionLoading}
                        >
                          💳 Pay Now
                        </button>
                        <button
                          onClick={() => handleCancel(booking.bookingId || booking._id)}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition"
                          disabled={actionLoading}
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    {booking.status === 'FAILED' && (
                      <button
                        onClick={() => setSelectedBookingForPayment(booking)}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow transition"
                        disabled={actionLoading}
                      >
                        ↻ Retry Payment
                      </button>
                    )}

                    {booking.status === 'CONFIRMED' && (
                      <Link
                        to={`/payment-console?bookingId=${booking.bookingId || booking._id}`}
                        className="px-3 py-1.5 text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 rounded-lg hover:bg-sky-100 transition"
                      >
                        Receipt / Webhook Log
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Payment Simulation Modal */}
      {selectedBookingForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900">Payment Simulation</h2>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Simulate payment gateway response for Booking{' '}
              <strong className="text-slate-800">
                {selectedBookingForPayment.bookingId || `#${selectedBookingForPayment._id.slice(-6).toUpperCase()}`}
              </strong>
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-5 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Test:</span>
                <span className="font-semibold text-slate-800">
                  {selectedBookingForPayment.test?.name || selectedBookingForPayment.testName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Centre:</span>
                <span className="text-slate-800">
                  {selectedBookingForPayment.centre?.name || selectedBookingForPayment.centreName}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm">
                <span className="font-bold text-slate-800">Amount Due:</span>
                <span className="font-extrabold text-sky-700">₹{selectedBookingForPayment.amount}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-3 font-medium">
              Choose an outcome to update status:
            </p>

            <div className="flex gap-2.5 mb-3">
              <button
                type="button"
                className="flex-1 py-2.5 px-3 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 transition shadow"
                onClick={() => handleDirectPayment(selectedBookingForPayment.bookingId || selectedBookingForPayment._id, true)}
                disabled={actionLoading}
              >
                ✓ Success (Confirm)
              </button>
              <button
                type="button"
                className="flex-1 py-2.5 px-3 text-xs font-bold rounded-xl text-white bg-rose-600 hover:bg-rose-700 transition shadow"
                onClick={() => handleDirectPayment(selectedBookingForPayment.bookingId || selectedBookingForPayment._id, false)}
                disabled={actionLoading}
              >
                ✕ Failure (Failed)
              </button>
            </div>

            <button
              type="button"
              className="w-full py-2 px-3 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition"
              onClick={() => setSelectedBookingForPayment(null)}
              disabled={actionLoading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
