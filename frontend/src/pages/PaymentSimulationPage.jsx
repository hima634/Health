import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { bookingsService, paymentsService } from '../api/services';

const PaymentSimulationPage = () => {
  const [searchParams] = useSearchParams();
  const urlBookingParam = searchParams.get('bookingId') || '';

  const [bookings, setBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState(urlBookingParam);
  const [transactionId, setTransactionId] = useState(`TXN_${Date.now()}`);
  const [status, setStatus] = useState('SUCCESS');
  const [amount, setAmount] = useState(300);

  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await bookingsService.getUserBookings();
      const list = res.data || [];
      setBookings(list);

      if (list.length > 0) {
        // If url param matched a booking, pick it; otherwise pick first
        const match = list.find(
          (b) => b.bookingId === urlBookingParam || b._id === urlBookingParam
        );
        const active = match || list[0];
        setSelectedBookingId(active.bookingId || active._id);
        setAmount(active.amount || 300);
      }
    } catch (e) {
      console.error('Error fetching bookings:', e);
    }
  };

  const handleBookingSelect = (e) => {
    const val = e.target.value;
    setSelectedBookingId(val);
    const chosen = bookings.find((b) => b.bookingId === val || b._id === val);
    if (chosen) {
      setAmount(chosen.amount || 300);
    }
  };

  const generateNewTxn = () => {
    setTransactionId(`TXN_${Date.now()}`);
  };

  const addLog = (title, details, isError = false, isDuplicate = false) => {
    setLogs((prev) => [
      {
        id: Date.now() + Math.random(),
        time: new Date().toLocaleTimeString(),
        title,
        details,
        isError,
        isDuplicate
      },
      ...prev
    ]);
  };

  const handleSendWebhook = async () => {
    if (!selectedBookingId) {
      return alert('Please select a booking to proceed.');
    }
    setLoading(true);

    const payload = {
      transactionId,
      bookingId: selectedBookingId,
      status,
      amount: Number(amount)
    };

    try {
      const res = await paymentsService.triggerWebhook(payload);
      const isDup = res.isDuplicate === true;
      addLog(
        isDup ? '⚠️ Duplicate Webhook Handled' : `✅ Webhook Received [${status}]`,
        res.message || (isDup ? 'Duplicate webhook safely ignored. No double payment.' : 'Booking status updated successfully.'),
        false,
        isDup
      );
      fetchBookings();
    } catch (err) {
      addLog('❌ Webhook Request Failed', err.message || 'Error communicating with server', true);
    } finally {
      setLoading(false);
    }
  };

  const handleRunIdempotencyTest = async () => {
    if (!selectedBookingId) {
      return alert('Please select a booking first.');
    }
    setLoading(true);

    const sharedTxn = `TEST_IDEMP_${Date.now()}`;
    const payload = {
      transactionId: sharedTxn,
      bookingId: selectedBookingId,
      status: 'SUCCESS',
      amount: Number(amount)
    };

    try {
      // 1st request
      addLog(
        'Step 1: First Webhook Sent',
        `Sending initial payment event for booking with Transaction ID: ${sharedTxn}...`
      );
      const firstRes = await paymentsService.triggerWebhook(payload);
      addLog(
        '✅ First Webhook Result: PROCESSED',
        firstRes.message || 'Payment accepted and booking marked as CONFIRMED.'
      );

      // 2nd request (identical duplicate)
      addLog(
        'Step 2: Sending DUPLICATE Webhook',
        `Simulating network retry or duplicate gateway event with SAME Transaction ID: ${sharedTxn}...`
      );
      const secondRes = await paymentsService.triggerWebhook(payload);
      addLog(
        '🛡️ Duplicate Webhook Result: SAFELY CAUGHT',
        `Server returned HTTP 200: "${secondRes.message}". Duplicate prevented!`,
        false,
        true
      );

      fetchBookings();
    } catch (err) {
      addLog('❌ Idempotency Test Error', err.message || 'Error occurred during test', true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Payment Simulator & Webhook Testing
        </h1>
        <p className="text-slate-600 text-sm mt-1">
          Easily test payment gateway webhooks and see duplicate payment protection (idempotency) in action.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 mb-4">
              Simulate Payment Gateway Webhook
            </h2>

            {bookings.length === 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 mb-4">
                No bookings found yet.{' '}
                <Link to="/" className="font-bold underline text-amber-900">
                  Book an appointment first
                </Link>{' '}
                on the home page.
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Booking Appointment:
                </label>
                <select
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-800"
                  value={selectedBookingId}
                  onChange={handleBookingSelect}
                >
                  {bookings.map((b) => (
                    <option key={b._id} value={b.bookingId || b._id}>
                      {b.bookingId || `#${b._id.slice(-6).toUpperCase()}`} — {b.patientName} ({b.test?.name || b.testName}) — ₹{b.amount} [Status: {b.status}]
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Booking Reference
                </label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-800"
                  value={selectedBookingId}
                  onChange={(e) => setSelectedBookingId(e.target.value)}
                  placeholder="e.g. BK-1025"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Transaction ID (Unique Gateway Key)
                  </label>
                  <button
                    type="button"
                    onClick={generateNewTxn}
                    className="text-xs text-sky-600 hover:text-sky-700 font-bold"
                  >
                    + Generate New
                  </button>
                </div>
                <input
                  type="text"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gateway Status
                  </label>
                  <select
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="SUCCESS">SUCCESS (CONFIRMED)</option>
                    <option value="FAILED">FAILED (PAYMENT FAILED)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2.5">
              <button
                type="button"
                className="w-full py-2.5 px-4 text-xs font-bold rounded-lg text-white bg-sky-600 hover:bg-sky-700 transition shadow disabled:opacity-50"
                onClick={handleSendWebhook}
                disabled={loading}
              >
                {loading ? 'Sending...' : '🚀 Send Webhook Event'}
              </button>

              <button
                type="button"
                className="w-full py-2.5 px-4 text-xs font-bold rounded-lg text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition disabled:opacity-50"
                onClick={handleRunIdempotencyTest}
                disabled={loading}
              >
                🔄 Test Idempotency (Send Duplicate Webhook)
              </button>
            </div>
          </div>

          <div className="mt-6 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
            <strong className="text-slate-800">How Idempotency Works:</strong>
            <p className="mt-1 leading-relaxed text-[11px]">
              If a payment gateway retries a webhook notification with the same Transaction ID, the server safely intercepts it, leaves the booking intact, and prevents double charging.
            </p>
          </div>
        </div>

        {/* Audit Log Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
            <h2 className="text-base font-bold text-slate-900">Activity Log</h2>
            {logs.length > 0 && (
              <button
                onClick={() => setLogs([])}
                className="text-xs text-slate-400 hover:text-slate-600 font-medium"
              >
                Clear Log
              </button>
            )}
          </div>

          {logs.length === 0 ? (
            <div className="my-auto text-center py-16 text-slate-400 text-xs">
              No webhook events sent yet. Click "Send Webhook Event" or "Test Idempotency" to test.
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[480px] pr-1">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3.5 rounded-xl border text-xs ${
                    log.isError
                      ? 'bg-rose-50 border-rose-200 text-rose-800'
                      : log.isDuplicate
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span>{log.title}</span>
                    <span className="text-[11px] font-normal text-slate-500">{log.time}</span>
                  </div>
                  <p className="text-xs font-normal leading-relaxed">{log.details}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSimulationPage;
