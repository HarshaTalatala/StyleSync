import { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaTshirt, FaCalendarAlt, FaHistory, FaRegCalendarCheck, FaChartLine, 
  FaCog, FaBars, FaTimes, FaArrowUp, FaPalette, FaLayerGroup, FaSync
} from 'react-icons/fa';
import { getWardrobeItems } from '../services/wardrobeService';

const StatCard = ({ icon, label, value }) => (
  <div className="bg-white rounded-xl p-4 md:p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
    <div className="flex items-center mb-2">
      <div className="mr-3 text-lg">{icon}</div>
      <p className="text-slate-500 text-sm font-medium">{label}</p>
    </div>
    <p className="text-2xl md:text-3xl font-semibold text-slate-800 truncate">{value}</p>
  </div>
);

const ActionCard = ({ link, icon, name, bg }) => (
  <Link
    to={link}
    className="flex flex-col items-center justify-center p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow transition-all h-full active:scale-[0.98] active:bg-slate-50"
  >
    <div className={`${bg} p-3 rounded-full mb-3`}>
      {icon}
    </div>
    <span className="font-medium text-slate-800 text-center text-sm">{name}</span>
  </Link>
);

const RecentItemSkeleton = () => (
  <div className="animate-pulse flex items-center space-x-4 py-2">
    <div className="w-12 h-12 rounded-full bg-slate-200"></div>
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
    </div>
  </div>
);

const Dashboard = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';
  const mainContentRef = useRef(null);

  const [allItems, setAllItems] = useState([]);
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: <FaChartLine /> },
    { name: 'Wardrobe', path: '/wardrobe', icon: <FaTshirt /> },
    { name: 'Plan', path: '/plan', icon: <FaRegCalendarCheck /> },
    { name: 'Calendar', path: '/calendar', icon: <FaCalendarAlt /> },
    { name: 'History', path: '/history', icon: <FaHistory /> },
    { name: 'Settings', path: '/settings', icon: <FaCog /> },
  ];

  const stats = [
    { label: 'Total Items', value: allItems.length, icon: <FaTshirt className="text-indigo-500" /> },
    { label: 'Color Palette', value: new Set(allItems.map(item => item.color).filter(Boolean)).size, icon: <FaPalette className="text-amber-500" /> },
    { label: 'Categories', value: new Set(allItems.map(item => item.category)).size, icon: <FaLayerGroup className="text-emerald-500" /> }
  ];

  const quickActions = [
    { name: 'Add Item', path: '/wardrobe', icon: <FaTshirt className="h-6 w-6 text-indigo-600" />, bg: 'bg-indigo-100' },
    { name: 'Plan Outfit', path: '/plan', icon: <FaRegCalendarCheck className="h-6 w-6 text-emerald-600" />, bg: 'bg-emerald-100' },
    { name: 'View Calendar', path: '/calendar', icon: <FaCalendarAlt className="h-6 w-6 text-amber-600" />, bg: 'bg-amber-100' },
    { name: 'View History', path: '/history', icon: <FaHistory className="h-6 w-6 text-sky-600" />, bg: 'bg-sky-100' }
  ];

  useEffect(() => {
    setMobileMenuOpen(false);
    document.body.style.overflow = 'auto';
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      if (mainContentRef.current) {
        setShowScrollTop(mainContentRef.current.scrollTop > 300);
      }
    };
    const contentEl = mainContentRef.current;
    contentEl?.addEventListener('scroll', handleScroll);
    return () => contentEl?.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (currentUser) {
        setLoading(true);
        try {
          const items = await getWardrobeItems(currentUser.uid);
          setAllItems(items);
          const sorted = [...items].sort((a, b) => b.uploadedAt?.seconds - a.uploadedAt?.seconds);
          setRecentItems(sorted.slice(0, 4));
        } catch (error) {
          console.error('Failed to fetch wardrobe items:', error);
          setAllItems([]);
          setRecentItems([]);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [currentUser, lastRefresh]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setLastRefresh(Date.now());
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const toggleMobileMenu = () => {
    const isOpening = !mobileMenuOpen;
    setMobileMenuOpen(isOpening);
    document.body.style.overflow = isOpening ? 'hidden' : 'auto';
  };

  const scrollToTop = () => {
    mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  function getRelativeDate(dateString) {
    if (!dateString) return 'recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    const diffInDays = Math.floor(diffInSeconds / 86400);

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    return `${diffInDays} days ago`;
  }

  return (
    <div className="h-screen flex bg-slate-50">
      <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-slate-200 p-4">
        <div className="px-2 py-4 mb-4 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-indigo-700 font-bold capitalize">{userName.charAt(0)}</span>
          </div>
          <div>
            <p className="font-semibold text-slate-800 capitalize">{userName}</p>
          </div>
        </div>
        <nav className="flex-1 flex flex-col space-y-1">
          {navItems.map((item) => (
            <Link key={item.name} to={item.path} className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${ location.pathname === item.path ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'}`}>
              <span className="text-lg">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {mobileMenuOpen && <div className="md:hidden fixed inset-0 bg-black/40 z-40" onClick={toggleMobileMenu}></div>}
      <div className={`md:hidden fixed top-0 left-0 h-full w-3/4 max-w-xs bg-white z-50 shadow-xl transition-transform duration-300 ease-in-out ${ mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4">
          <div className="px-2 py-4 mb-4 flex items-center justify-between">
            <p className="font-semibold text-slate-800">Menu</p>
            <button onClick={toggleMobileMenu} className="p-2 rounded-full hover:bg-slate-100 active:bg-slate-200" aria-label="Close menu"><FaTimes /></button>
          </div>
          <nav className="flex flex-col space-y-1">
             {navItems.map((item) => (
              <Link key={item.name} to={item.path} className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${ location.pathname === item.path ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 active:bg-slate-100'}`}>
                <span className="text-xl">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col">
        <header className="md:hidden sticky top-0 bg-slate-50/80 backdrop-blur-sm z-30 flex items-center justify-between p-4 border-b border-slate-200/80">
          <h1 className="text-lg font-bold text-slate-800">
            Welcome, <span className="text-indigo-600">{userName}</span>
          </h1>
          <button onClick={toggleMobileMenu} className="p-2 text-slate-600 rounded-full active:bg-slate-200" aria-label="Open menu">
            <FaBars className="h-5 w-5" />
          </button>
        </header>

        <main ref={mainContentRef} className="flex-1 overflow-y-auto">
          {isRefreshing && (
            <div className="bg-indigo-50 text-indigo-700 text-center py-2 font-medium text-sm">
              Syncing your wardrobe...
            </div>
          )}
          <div className="p-4 md:p-8">
            <h1 className="hidden md:block text-3xl font-bold text-slate-800 mb-6">
              Dashboard
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
              {stats.map(s => <StatCard key={s.label} {...s} />)}
            </div>
            
            <div className="mb-6 md:mb-8">
              <h2 className="text-xl font-semibold text-slate-700 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map(action => <ActionCard key={action.name} link={action.path} {...action} />)}
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-700">Recent Activity</h2>
                <button onClick={handleRefresh} disabled={isRefreshing || loading} className="flex items-center space-x-2 text-sm text-indigo-600 font-medium p-2 rounded-lg hover:bg-indigo-50 active:bg-indigo-100 disabled:opacity-50 disabled:cursor-wait">
                  <FaSync className={isRefreshing ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
              </div>
              <div className="bg-white rounded-xl p-4 md:p-6 border border-slate-100 shadow-sm">
                <div className="space-y-4">
                  {loading ? (
                    [...Array(3)].map((_, i) => <RecentItemSkeleton key={i} />)
                  ) : recentItems.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <FaTshirt className="mx-auto text-4xl text-slate-300 mb-4" />
                      <h3 className="font-semibold text-slate-700">Your wardrobe is ready!</h3>
                      <p className="text-sm mb-4">Add your first item to see your activity here.</p>
                      <Link to="/wardrobe" className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                        Add First Item
                      </Link>
                    </div>
                  ) : (
                    recentItems.map(item => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {item.imageURL ? <img src={item.imageURL} alt={item.category} className="w-full h-full object-cover" /> : <FaTshirt className="text-slate-400 text-xl" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-800 text-sm md:text-base truncate">Added new {item.category || "item"}</p>
                          <p className="text-xs text-slate-500">{getRelativeDate(item.createdAt)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="h-20 md:hidden"></div>
        </main>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-slate-200 flex justify-around z-30">
        {navItems.slice(0, 5).map(item => (
          <Link key={item.path} to={item.path} className={`flex flex-col items-center justify-center w-full py-2 px-1 transition-colors ${location.pathname === item.path ? 'text-indigo-600' : 'text-slate-500 active:bg-slate-100'}`}>
            <span className="text-2xl mb-0.5">{item.icon}</span>
            <span className="text-[11px] font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      {showScrollTop && (
        <button onClick={scrollToTop} className="md:hidden fixed bottom-24 right-4 bg-indigo-600 text-white p-3 rounded-full shadow-lg z-20 active:scale-95 transition-transform" aria-label="Scroll to top">
          <FaArrowUp />
        </button>
      )}
    </div>
  );
};

export default Dashboard;