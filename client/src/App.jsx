import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Equipments from './pages/Equipments';
import Maintenance from './pages/Maintenance';
import CalendarPage from './pages/CalendarPage';
import Teams from './pages/Teams';
import Users from './pages/Users';
import Toast from './components/Toast';
import { ToastProvider } from './context/ToastContext';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <div className="app-layout">
          <Sidebar />
          <div className="main-area">
            <Navbar />
            <main className="page-content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/equipment" element={<Equipments />} />
                <Route path="/maintenance" element={<Maintenance />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/teams" element={<Teams />} />
                <Route path="/users" element={<Users />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </div>
        <Toast />
      </BrowserRouter>
    </ToastProvider>
  );
}
