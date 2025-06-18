import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FaTshirt } from 'react-icons/fa';
import { useState, useEffect, useRef } from 'react';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [navHeight, setNavHeight] = useState(0);
  const navbarRef = useRef(null);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully!');
      navigate('/login');
    } catch (error) {
      toast.error(`Logout failed: ${error.message}`);
    }
  };

  const userDisplayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';

  useEffect(() => {
    if (navbarRef.current) {
      const height = navbarRef.current.offsetHeight;
      setNavHeight(height);
      document.documentElement.style.setProperty('--navbar-height', `${height}px`);
    }
    const handleResize = () => {
      if (navbarRef.current) {
        const height = navbarRef.current.offsetHeight;
        setNavHeight(height);
        document.documentElement.style.setProperty('--navbar-height', `${height}px`);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <motion.nav 
      ref={navbarRef}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="backdrop-blur-sm bg-slate-50/95 py-4 px-6 shadow-sm text-slate-800 border-b border-slate-200 sticky top-0 z-50"
    >
      <div className="container mx-auto flex justify-between items-center">
        <Link 
          to={currentUser ? "/dashboard" : "/"} 
          className="group flex items-center space-x-2"
        >
          <span className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-lg shadow-md shadow-indigo-200">
            <FaTshirt className="text-lg" />
          </span>
          <span className="text-2xl text-slate-800 font-light tracking-wide flex items-center">
            <span className="font-medium text-indigo-600 group-hover:text-indigo-700 transition-colors duration-300">Style</span>
            <span className="group-hover:text-slate-900 transition-colors duration-300">Sync</span>
          </span>
        </Link>
        
        <div className="flex items-center space-x-8">
          {currentUser ? (
            <>
              <div className="hidden md:flex space-x-6 items-center">
                {[
                  { name: "Dashboard", path: "/dashboard" },
                  { name: "Wardrobe", path: "/wardrobe" },
                  { name: "Outfits", path: "/history" }
                ].map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`text-sm font-medium relative ${
                      location.pathname === item.path 
                        ? "text-indigo-600" 
                        : "text-slate-600 hover:text-slate-900"
                    } transition-colors duration-300`}
                  >
                    {item.name}
                    {location.pathname === item.path && (
                      <motion.span 
                        layoutId="navIndicator"
                        className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-indigo-600"
                      />
                    )}
                  </Link>
                ))}
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-slate-600 hidden md:flex items-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-700 font-medium text-sm capitalize">{userDisplayName.charAt(0)}</span>
                  </div>
                </span>
                <button
                  onClick={handleLogout}
                  className="px-5 py-2.5 text-sm border border-slate-200 rounded-md text-slate-700 hover:bg-slate-100 hover:border-slate-300 hover:shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-4">
                <Link to="/login" className="px-5 py-2.5 text-sm font-medium rounded-md bg-white text-indigo-600 hover:shadow-md hover:shadow-indigo-200 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                  Log In
                </Link>
                <Link 
                  to="/signup" 
                  className="px-5 py-2.5 text-sm font-medium rounded-md bg-gradient-to-r from-indigo-500 to-indigo-700 text-white hover:shadow-md hover:shadow-indigo-200 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  Sign Up
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;