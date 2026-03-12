import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
// import { ThemeProvider } from './context/ThemeContext'; // Removed for static theme
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Schedule from './pages/Schedule';
import Reports from './pages/Reports';
import Tickets from './pages/Tickets';
import TicketDetail from './pages/TicketDetail';
import Profile from './pages/Profile';
import Sites from './pages/Sites';
import SiteDetail from './pages/SiteDetail'; // PHASE 5
import StarlinkManagement from './pages/StarlinkManagement'; // NEW
import AccountManagement from './pages/AccountManagement';
import Activity from './pages/Activity'; // NEW: Activity page
import Categories from './pages/Categories'; // NEW: SuperUser category management
import Statistics from './pages/Statistics'; // NEW: User statistics
import VersionUpdates from './pages/VersionUpdates'; // NEW: Version Update Log
import Layout from './components/Layout';
import { Toaster } from './components/ui/sonner';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <AuthProvider>
      {/* <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme"> */}
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/activity" element={<ProtectedRoute><Activity /></ProtectedRoute>} />
            <Route path="/scheduler" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/statistics" element={<ProtectedRoute><Statistics /></ProtectedRoute>} />
            <Route path="/tickets" element={<ProtectedRoute><Tickets /></ProtectedRoute>} />
            <Route path="/tickets/:ticketId" element={<ProtectedRoute><TicketDetail /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/sites" element={<ProtectedRoute><Sites /></ProtectedRoute>} />
            <Route path="/sites/:siteId" element={<ProtectedRoute><SiteDetail /></ProtectedRoute>} /> {/* PHASE 5 */}
            <Route path="/starlink" element={<ProtectedRoute><StarlinkManagement /></ProtectedRoute>} /> {/* NEW: Starlink Management */}
            <Route path="/accounts" element={<ProtectedRoute><AccountManagement /></ProtectedRoute>} />
            <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} /> {/* SuperUser only */}
            <Route path="/updates" element={<ProtectedRoute><VersionUpdates /></ProtectedRoute>} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </NotificationProvider>
      {/* </ThemeProvider> */}
    </AuthProvider>
  );
}

export default App;
