import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import RoomTypes from './pages/RoomTypes'; // Add this import
import RoomList from './pages/RoomList';
import RoomDetail from './pages/RoomDetail';
import ReservationList from './pages/ReservationList';
import ReservationDetail from './pages/ReservationDetail';
import ReservationForm from './pages/ReservationForm';
import CustomerList from './pages/CustomerList';
import CustomerDetail from './pages/CustomerDetail';
import CustomerForm from './pages/CustomerForm';
import ReviewForm from './pages/ReviewForm';
import SQLQueryInterface from './pages/SQLQueryInterface';
import DatabaseFeatures from './pages/DatabaseFeatures';
import ErrorHandlingDemo from './pages/ErrorHandlingDemo';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/roomtypes" element={<RoomTypes />} />
            <Route path="/rooms" element={<RoomList />} />
            <Route path="/rooms/:roomId" element={<RoomDetail />} />
            <Route path="/reservations" element={<ReservationList />} />
            <Route path="/reservations/new" element={<ReservationForm />} />
            <Route path="/reservations/:reservationId" element={<ReservationDetail />} />
            <Route path="/reservations/:reservationId/edit" element={<ReservationForm />} />
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/customers/new" element={<CustomerForm />} />
            <Route path="/customers/:customerId" element={<CustomerDetail />} />
            <Route path="/customers/:customerId/edit" element={<CustomerForm />} />
            <Route path="/reviews/new" element={<ReviewForm />} />
            <Route path="/sql-interface" element={<SQLQueryInterface />} />
            <Route path="/database-features" element={<DatabaseFeatures />} />
            <Route path="/error-handling" element={<ErrorHandlingDemo />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
