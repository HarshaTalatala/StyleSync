import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage'; 
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Wardrobe from './pages/Wardrobe';
import PlanOutfit from './pages/PlanOutfit';
import CalendarView from './pages/CalendarView';
import History from './pages/History';
import Settings from './pages/Settings';

// Components
import Navbar from './components/Navbar';

// PrivateRoute component
const PrivateRoute = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-xl">Loading...</div>;
  }

  return currentUser ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/wardrobe" element={<Wardrobe />} />
          <Route path="/plan" element={<PlanOutfit />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;