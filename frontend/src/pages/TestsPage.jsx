import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { testsService, centresService, bookingsService } from '../api/services';
import { useAuth } from '../context/AuthContext';

const TIME_SLOTS = [
  '08:00 AM',
  '09:00 AM',
  '10:00 AM',
  '11:30 AM',
  '02:00 PM',
  '04:00 PM',
  '05:30 PM'
];

const TestsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [centres, setCentres] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking Form State
  const [selectedCentreId, setSelectedCentreId] = useState('');
  const [selectedTestId, setSelectedTestId] = useState('');
  const [patientName, setPatientName] = useState(user?.name || '');
  const [patientPhone, setPatientPhone] = useState('9876543210');
  const [appointmentDate, setAppointmentDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [appointmentTime, setAppointmentTime] = useState(TIME_SLOTS[1]);
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (user?.name && !patientName) {
      setPatientName(user.name);
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [centresRes, testsRes] = await Promise.all([
        centresService.getAll(),
        testsService.getAll()
      ]);

      const centresData = centresRes.data || [];
      const testsData = testsRes.data || [];

      setCentres(centresData);
      setTests(testsData);

      // Pre-select first centre and first test for immediate ease of use
      if (centresData.length > 0) setSelectedCentreId(centresData[0]._id);
      if (testsData.length > 0) setSelectedTestId(testsData[0]._id);
    } catch (err) {
      setError(err.message || 'Could not connect to backend. Please ensure server is running.');
    } finally {
      setLoading(false);
    }
  };

  const selectedTest = tests.find((t) => t._id === selectedTestId);
  const selectedCentre = centres.find((c) => c._id === selectedCentreId);

  const handleQuickBook = async (e) => {
    e.preventDefault();
    if (!selectedCentreId || !selectedTestId) {
      return alert('Please select a centre and a test.');
    }
    if (!patientName.trim()) {
      return alert('Please enter patient name.');
    }

    try {
      setSubmitting(true);
      setError('');
      const res = await bookingsService.create({
        centreId: selectedCentreId,
        testId: selectedTestId,
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        appointmentDate,
        appointmentTime
      });

      setBookingSuccess(res.data);
      // Scroll to confirmation
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message || 'Failed to book appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Hero Intro */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Book Diagnostic Tests & Lab Services
        </h1>
        <p className="text-slate-600 mt-2 max-w-xl mx-auto text-sm sm:text-base">
          Choose an accredited diagnostic centre, select your lab test, and schedule your appointment in seconds.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-sm">
          <strong>Notice:</strong> {error}
        </div>
      )}

      {/* Booking Success Banner */}
      {bookingSuccess && (
        <div className="mb-8 p-6 bg-emerald-50 border-2 border-emerald-400 rounded-2xl shadow-sm text-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">✅</span>
                <h2 className="text-xl font-bold text-emerald-900">
                  Appointment Successfully Booked!
                </h2>
              </div>
              <p className="text-sm text-slate-700 mt-1">
                Booking ID:{' '}
                <span className="font-mono font-bold bg-white px-2.5 py-1 rounded border border-emerald-300 text-emerald-800">
                  {bookingSuccess.bookingId || `#${bookingSuccess._id.slice(-6).toUpperCase()}`}
                </span>
              </p>
              <div className="text-xs text-slate-600 mt-2 space-y-0.5">
                <div><strong>Patient:</strong> {bookingSuccess.patientName} ({bookingSuccess.patientPhone})</div>
                <div><strong>Test:</strong> {bookingSuccess.testName || selectedTest?.name} • <strong>Centre:</strong> {bookingSuccess.centreName || selectedCentre?.name}</div>
                <div><strong>Date & Time:</strong> {new Date(bookingSuccess.appointmentDate).toLocaleDateString()} at {bookingSuccess.appointmentTime}</div>
                <div><strong>Amount:</strong> ₹{bookingSuccess.amount} (Status: <span className="font-semibold text-amber-700">{bookingSuccess.status}</span>)</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
              <Link
                to={`/payment-console?bookingId=${bookingSuccess.bookingId || bookingSuccess._id}`}
                className="text-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow transition"
              >
                💳 Pay / Simulate Webhook
              </Link>
              <Link
                to="/my-bookings"
                className="text-center px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-lg border border-slate-300 shadow-sm transition"
              >
                📋 View My Bookings
              </Link>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-slate-500 font-medium">
          Loading diagnostic options...
        </div>
      ) : (
        <form onSubmit={handleQuickBook} className="space-y-8">
          {/* STEP 1: Diagnostic Centres */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-7 h-7 rounded-full bg-sky-600 text-white text-sm font-bold flex items-center justify-center">
                1
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Select Diagnostic Centre
              </h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Choose from our verified partner diagnostic labs in your city:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {centres.map((centre) => {
                const isSelected = selectedCentreId === centre._id;
                return (
                  <div
                    key={centre._id}
                    onClick={() => setSelectedCentreId(centre._id)}
                    className={`cursor-pointer p-4 rounded-xl border-2 transition text-left flex flex-col justify-between ${
                      isSelected
                        ? 'border-sky-600 bg-sky-50/50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-sm text-slate-900">
                          {centre.name}
                        </span>
                        {isSelected && (
                          <span className="text-sky-600 text-xs font-bold bg-sky-100 px-2 py-0.5 rounded-full">
                            ✓ Selected
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600">{centre.city}</p>
                      <p className="text-[11px] text-slate-500 mt-1">{centre.address}</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>🕒 {centre.timings}</span>
                      <span>📞 {centre.phone}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 2: Diagnostic Tests */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-7 h-7 rounded-full bg-sky-600 text-white text-sm font-bold flex items-center justify-center">
                2
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Select Diagnostic Test
              </h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Pick the lab test you need to schedule:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {tests.map((test) => {
                const isSelected = selectedTestId === test._id;
                return (
                  <div
                    key={test._id}
                    onClick={() => setSelectedTestId(test._id)}
                    className={`cursor-pointer p-4 rounded-xl border-2 transition text-left flex flex-col justify-between ${
                      isSelected
                        ? 'border-sky-600 bg-sky-50/50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="font-bold text-sm text-slate-900">
                          {test.name}
                        </span>
                        <span className="text-base font-extrabold text-sky-700 whitespace-nowrap">
                          ₹{test.price}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                        {test.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                      <span>⏱ {test.turnaroundHours}h result</span>
                      <span>
                        {test.fastingRequired ? '🍽 Fasting' : 'No fasting'}
                      </span>
                      {isSelected ? (
                        <span className="text-sky-600 font-bold">✓ Selected</span>
                      ) : (
                        <span className="text-slate-400 font-medium">Select</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 3: Appointment & Patient Details */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-7 h-7 rounded-full bg-sky-600 text-white text-sm font-bold flex items-center justify-center">
                3
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Patient & Appointment Details
              </h2>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Enter patient information and preferred appointment schedule:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Appointment Date *
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Preferred Time Slot *
                </label>
                <select
                  required
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Summary Bar & Submit */}
            <div className="mt-8 pt-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-left w-full sm:w-auto">
                <div className="text-xs text-slate-500">Selected Test & Centre:</div>
                <div className="font-semibold text-slate-800 text-sm">
                  {selectedTest?.name || 'Please select test'} @ {selectedCentre?.name || 'Please select centre'}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-8 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm sm:text-base rounded-xl shadow-md transition disabled:opacity-50"
              >
                {submitting ? 'Confirming...' : `📅 Book Appointment (Total: ₹${selectedTest?.price || 0})`}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default TestsPage;
