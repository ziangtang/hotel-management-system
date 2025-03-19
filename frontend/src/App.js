import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import HotelList from './pages/HotelList';
import RoomList from './pages/RoomList';
import ReservationList from './pages/ReservationList';
import CustomerList from './pages/CustomerList';
import NewReservation from './pages/NewReservation';
import ReservationDetail from './pages/ReservationDetail';
import EditReservation from './pages/EditReservation';
// Add this import for NewCustomer
import NewCustomer from './components/NewCustomer';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2c3e50', // Dark blue/slate color
    },
    secondary: {
      main: '#e74c3c', // Red accent color
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h4: {
      fontWeight: 500,
    },
    button: {
      textTransform: 'none', // Prevents all-caps buttons
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Navbar />
          <div className="content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/hotels" element={<HotelList />} />
              <Route path="/hotels/:hotelId/rooms" element={<RoomList />} />
              <Route path="/reservations" element={<ReservationList />} />
              <Route path="/reservations/new" element={<NewReservation />} />
              {/* Move the edit route before the detail route */}
              <Route path="/reservations/edit/:reservationId" element={<EditReservation />} />
              <Route path="/reservations/:reservationId" element={<ReservationDetail />} />
              <Route path="/customers" element={<CustomerList />} />
              <Route path="/customers/new" element={<NewCustomer />} />
            </Routes>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
