import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import TestsPage from './pages/TestsPage';
import BookingPage from './pages/BookingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import PaymentSimulationPage from './pages/PaymentSimulationPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<TestsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* Protected Routes (Requires Login) */}
              <Route
                path="/book/:testId"
                element={
                  <ProtectedRoute>
                    <BookingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute>
                    <MyBookingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payment-console"
                element={
                  <ProtectedRoute>
                    <PaymentSimulationPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500 bg-white">
            EveHealth Diagnostic Booking System
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
