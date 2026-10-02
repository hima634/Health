import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testsService, bookingsService } from '../api/services';
import { useAuth } from '../context/AuthContext';

const TIME_SLOTS = [
  '07:30 AM',
  '08:30 AM',
  '09:30 AM',
  '10:30 AM',
  '11:30 AM',
  '02:00 PM',
  '03:30 PM',
  '05:00 PM',
  '06:30 PM'
];

const BookingPage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [test, setTest] = useState(null);
  const [centreId, setCentreId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState(TIME_SLOTS[1]);
  const [patientNotes, setPatientNotes] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const todayString = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchTestDetails = async () => {
      try {
        setLoading(true);
        const res = await testsService.getById(testId);
        setTest(res.data);
        if (res.data?.centres && res.data.centres.length > 0) {
          setCentreId(res.data.centres[0]._id);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch test details');
      } finally {
        setLoading(false);
      }
    };

    fetchTestDetails();
  }, [testId]);

  const [patientName, setPatientName] = useState(user?.name || '');
  const [patientPhone, setPatientPhone] = useState('9876543210');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!centreId || !appointmentDate || !appointmentTime) {
      return setError('Please choose diagnostic centre, date and time slot.');
    }

    setSubmitting(true);
    try {
      await bookingsService.create({
        testId,
        centreId,
        patientName: patientName || 'Patient',
        patientPhone: patientPhone || '9876543210',
        appointmentDate,
        appointmentTime,
        patientNotes
      });

      navigate('/my-bookings');
    } catch (err) {
      setError(err.message || 'Failed to create booking.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-slate-500 text-sm">
        Loading test details...
      </div>
    );
  }

  if (!test) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="p-4 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-sm">
          Diagnostic test not found.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">Book Diagnostic Test</h2>
        <p className="text-sm text-slate-500 mt-1 mb-6">
          Schedule an in-lab appointment at your preferred diagnostic centre
        </p>

        {error && (
          <div className="mb-6 p-3 rounded-lg text-sm bg-rose-50 text-rose-700 border border-rose-200">
            {error}
          </div>
        )}

        {/* Selected Test Summary Banner */}
        <div className="bg-sky-50 border border-sky-100 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-sky-900 text-base">{test.name}</h3>
              <p className="text-xs text-sky-700 mt-0.5">Code: {test.testCode}</p>
            </div>
            <span className="text-2xl font-black text-sky-700">₹{test.price}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-sky-200/60 text-xs text-sky-800 flex gap-4">
            <span>⏱ {test.turnaroundHours}h report</span>
            <span>🍽 Fasting: {test.fastingRequired ? 'Yes' : 'No'}</span>
            <span>🩸 {test.sampleRequired}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Patient Name *
              </label>
              <input
                type="text"
                required
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                placeholder="e.g. Rahul Sharma"
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
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                placeholder="e.g. 9876543210"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Diagnostic Centre
            </label>
            <select
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              value={centreId}
              onChange={(e) => setCentreId(e.target.value)}
              required
            >
              <option value="">Select a Centre</option>
              {test.centres?.map((centre) => (
                <option key={centre._id} value={centre._id}>
                  {centre.name} - {centre.city} ({centre.address})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Appointment Date
              </label>
              <input
                type="date"
                min={todayString}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Time Slot
              </label>
              <select
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                required
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Patient Notes / Medical Notes (Optional)
            </label>
            <textarea
              rows="2"
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              placeholder="e.g. Any medication history, wheelchair assistance, or latex allergy..."
              value={patientNotes}
              onChange={(e) => setPatientNotes(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold rounded-lg text-white bg-sky-600 hover:bg-sky-700 transition shadow-sm disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? 'Confirming...' : 'Confirm Reservation (Status: PENDING)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingPage;
