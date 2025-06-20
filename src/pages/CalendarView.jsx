import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAuth } from '../context/AuthContext';
import { getAllPlannedOutfits } from '../services/plannerService';
import { getWardrobeItems } from '../services/wardrobeService';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaTshirt, FaPencilAlt, FaTimes, FaArrowLeft } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const CalendarView = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [plannedOutfitsMap, setPlannedOutfitsMap] = useState({});
  const [wardrobeItems, setWardrobeItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const [outfits, wardrobe] = await Promise.all([
        getAllPlannedOutfits(currentUser.uid),
        getWardrobeItems(currentUser.uid),
      ]);
      const outfitsMap = outfits.reduce((acc, outfit) => {
        acc[outfit.date] = outfit;
        return acc;
      }, {});
      setPlannedOutfitsMap(outfitsMap);
      setWardrobeItems(wardrobe);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const generateCalendarDays = () => {
    const days = [];
    const firstDay = currentMonth.startOf('month').day();
    const daysInPrevMonth = currentMonth.subtract(1, 'month').daysInMonth();
    
    for (let i = firstDay; i > 0; i--) {
      const date = currentMonth.subtract(1, 'month').date(daysInPrevMonth - i + 1).format('YYYY-MM-DD');
      days.push({ type: 'prev', date });
    }

    for (let i = 1; i <= currentMonth.daysInMonth(); i++) {
      const date = currentMonth.date(i).format('YYYY-MM-DD');
      days.push({ type: 'current', date, outfit: plannedOutfitsMap[date] });
    }

    const remainingSlots = 42 - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
        const date = currentMonth.add(1, 'month').date(i).format('YYYY-MM-DD');
        days.push({ type: 'next', date });
    }
    return days;
  };

  const handleDayClick = (date) => {
    setSelectedDate(date);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => setIsDrawerOpen(false);

  const goToPrevMonth = () => setCurrentMonth(currentMonth.subtract(1, 'month'));
  const goToNextMonth = () => setCurrentMonth(currentMonth.add(1, 'month'));
  const goToToday = () => {
    const today = dayjs().format('YYYY-MM-DD');
    setCurrentMonth(dayjs());
    if (window.innerWidth < 768) {
        handleDayClick(today);
    } else {
        setSelectedDate(today);
    }
  };
  
  const getCategoryItem = (outfit, category) => {
    if (!outfit) return null;
    const keyMap = { Top: 'topId', Bottom: 'bottomId', Shoes: 'shoeId', Accessory: 'accessoryId' };
    return wardrobeItems.find(item => item.id === outfit[keyMap[category]]);
  };

  const selectedOutfitDetails = selectedDate ? plannedOutfitsMap[selectedDate] : null;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mb-3"></div>
            <p className="text-slate-500">Loading your calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <header className="md:hidden sticky top-0 bg-white/80 backdrop-blur-sm z-30 flex items-center justify-start p-4 border-b border-slate-200/80 gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-slate-100 text-indigo-600 active:bg-indigo-100 transition-colors"
          aria-label="Go back"
        >
          <FaArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold text-slate-800">
          Calendar
        </h1>
      </header>
      
      <div className="hidden md:flex justify-between items-center p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-slate-100 text-indigo-600 hover:bg-indigo-100 transition-colors"
              title="Go Back"
            >
                <FaArrowLeft size={18}/>
            </button>
            <h1 className="text-2xl font-bold text-slate-800">Outfit Calendar</h1>
        </div>
        <button onClick={goToToday} className="px-4 py-2 text-sm font-semibold rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-all">
          Go to Today
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row md:p-6 md:gap-6 overflow-hidden">
        <div className="flex-1 flex flex-col bg-white md:rounded-xl md:shadow-sm md:border md:border-slate-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center">
            <button onClick={goToPrevMonth} className="p-2 rounded-full hover:bg-slate-100 active:bg-slate-200 transition-colors" aria-label="Previous month"><FaChevronLeft /></button>
            <div className='text-center'>
              <h2 className="text-base md:text-lg font-semibold text-slate-800">{currentMonth.format('MMMM YYYY')}</h2>
              <button onClick={goToToday} className="md:hidden text-xs font-semibold text-indigo-600">Today</button>
            </div>
            <button onClick={goToNextMonth} className="p-2 rounded-full hover:bg-slate-100 active:bg-slate-200 transition-colors" aria-label="Next month"><FaChevronRight /></button>
          </div>
          
          <div className="grid grid-cols-7 border-b border-slate-100">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
              <div key={day} className="py-2.5 text-center text-xs md:text-sm font-medium text-slate-500">{day.charAt(0)}</div>
            ))}
          </div>

          <div className="flex-1 grid grid-cols-7 grid-rows-6">
            {generateCalendarDays().map(({ type, date, outfit }, index) => (
              <div
                key={index}
                onClick={() => type === 'current' && handleDayClick(date)}
                className={`
                  relative border-r border-b border-slate-100 p-1.5 flex flex-col transition-colors
                  ${type === 'current' ? 'bg-white hover:bg-slate-50 cursor-pointer' : 'bg-slate-50/70 text-slate-400'}
                  ${date === dayjs().format('YYYY-MM-DD') ? 'bg-indigo-50/80' : ''}
                  ${selectedDate === date && 'md:ring-2 md:ring-indigo-400 md:z-10'}
                `}
              >
                <span className={`text-xs font-semibold ${date === dayjs().format('YYYY-MM-DD') ? 'text-indigo-600' : 'text-slate-600'}`}>
                  {dayjs(date).format('D')}
                </span>
                
                {outfit && getCategoryItem(outfit, 'Top') && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 flex items-center justify-center md:hidden"
                  >
                    <img
                      src={getCategoryItem(outfit, 'Top')?.imageURL}
                      alt="Top"
                      className="w-10 h-10 object-cover rounded-full shadow"
                    />
                  </motion.div>
                )}
                
                {outfit && getCategoryItem(outfit, 'Top') && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hidden md:flex flex-1 items-center justify-center mt-1">
                    <img
                      src={getCategoryItem(outfit, 'Top')?.imageURL}
                      alt="Top"
                      className="w-12 h-12 object-cover rounded-full shadow-md"
                    />
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence>
          <motion.div className="hidden md:block md:w-1/3 lg:w-1/4 xl:w-1/5">
             <OutfitDetails
                date={selectedDate}
                outfit={selectedOutfitDetails}
                getCategoryItem={getCategoryItem}
              />
          </motion.div>
        </AnimatePresence>
      </div>

      <motion.div>
        {isDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDrawer}
              className="md:hidden fixed inset-0 bg-black/40 z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="md:hidden fixed bottom-0 left-0 right-0 h-[85vh] bg-white rounded-t-2xl z-50 flex flex-col"
            >
              <div className="p-4 border-b border-slate-200 flex-shrink-0">
                <div className="w-10 h-1.5 bg-slate-300 rounded-full mx-auto mb-3"></div>
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg text-slate-800">
                        {selectedDate ? dayjs(selectedDate).format('MMMM D, YYYY') : 'Details'}
                    </h3>
                    <button onClick={closeDrawer} className="p-2 rounded-full text-slate-500 active:bg-slate-100"><FaTimes /></button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                 <OutfitDetails
                    date={selectedDate}
                    outfit={selectedOutfitDetails}
                    getCategoryItem={getCategoryItem}
                    isMobile
                  />
              </div>
            </motion.div>
          </>
        )}
      </motion.div>
      <div className="md:hidden h-16"></div>
    </div>
  );
};


const OutfitDetails = ({ date, outfit, getCategoryItem, isMobile = false }) => {
  if (!date) {
    return (
      <div className={`flex flex-col items-center justify-center h-full ${isMobile ? 'p-8' : ''}`}>
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCalendarAlt className="text-slate-400 text-4xl" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700">Select a Date</h3>
        <p className="text-sm text-slate-500 text-center">Choose a day to see the planned outfit.</p>
      </div>
    );
  }

  if (!outfit) {
    return (
      <div className={`flex flex-col items-center justify-center h-full ${isMobile ? 'p-8' : ''}`}>
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTshirt className="text-slate-400 text-4xl" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700">No Outfit Planned</h3>
        <p className="text-sm text-slate-500 mb-6 text-center">Plan your look for {dayjs(date).format('MMMM D')}.</p>
        <Link to={`/plan?date=${date}`} className="bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-md w-full text-center">
            Plan Outfit
        </Link>
      </div>
    );
  }

  return (
    <div className={`p-4 md:p-0 h-full flex flex-col`}>
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <span className="px-3 py-1 text-sm font-medium rounded-full bg-emerald-100 text-emerald-800">
            Outfit Planned
        </span>
        <Link to={`/plan?date=${date}`} className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800">
            <FaPencilAlt size={12} />
            Edit
        </Link>
      </div>

      <div className="flex-1 space-y-4">
        {['Top', 'Bottom', 'Shoes', 'Accessory'].map(category => {
          const item = getCategoryItem(outfit, category);
          return (
            <div key={category} className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-slate-100 flex-shrink-0 flex items-center justify-center border border-slate-200 overflow-hidden">
                {item ? <img src={item.imageURL} alt={category} className="w-full h-full object-cover"/> : <FaTshirt className="text-slate-300 text-2xl"/>}
              </div>
              <div className='overflow-hidden'>
                <p className="text-xs font-semibold text-indigo-600">{category}</p>
                <p className="font-medium text-slate-800 truncate">{item?.description || 'Not selected'}</p>
                {item && <p className="text-xs text-slate-500 capitalize">{item.color}</p>}
              </div>
            </div>
          );
        })}
      </div>

       <div className={`mt-auto pt-4 ${isMobile ? 'sticky bottom-0 bg-white py-4 px-4 border-t border-slate-200' : ''}`}>
          <Link to={`/plan?date=${date}`} className="bg-indigo-600 text-white font-semibold py-3 px-5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-md w-full text-center flex items-center justify-center gap-2">
            <FaPencilAlt size={14}/>
            Modify Outfit
          </Link>
       </div>
    </div>
  );
};

export default CalendarView;