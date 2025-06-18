import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getWardrobeItems } from '../services/wardrobeService';
import { savePlannedOutfit, getPlannedOutfit } from '../services/plannerService';
import { useLocation, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { FaCalendarAlt, FaTshirt, FaSave, FaCheck, FaArrowLeft } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const WardrobeItemCard = ({ item, isSelected, onSelect }) => {
  return (
    <motion.div
      onClick={onSelect}
      className="relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 ease-in-out group bg-white"
      animate={{ opacity: isSelected ? 1 : 0.85 }}
      whileHover={{ scale: 1.03, opacity: 1 }}
    >
      <div 
        className={`absolute inset-0 rounded-xl border-2 transition-colors z-10 pointer-events-none ${
          isSelected ? 'border-indigo-500 shadow-lg' : 'border-transparent group-hover:border-slate-300'
        }`}
      />
      <img
        src={item.imageURL || 'https://via.placeholder.com/150'}
        alt={item.description || item.category}
        className="w-full h-32 object-cover"
      />
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute top-2 right-2 w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center border-2 border-white shadow z-20"
          >
            <FaCheck className="text-white" size={12} />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="p-2 text-center border-t border-slate-100">
        <p className="font-semibold text-sm truncate text-slate-800">{item.description || item.category}</p>
        <p className="text-xs text-slate-500 capitalize">{item.color || ' '}</p>
      </div>
    </motion.div>
  );
};

const PlanOutfit = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [wardrobe, setWardrobe] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [saving, setSaving] = useState(false);
  const [selectedOutfit, setSelectedOutfit] = useState({ topId: null, bottomId: null, shoeId: null, accessoryId: null });
  const [activeCategory, setActiveCategory] = useState('Top');
  const categories = ['Top', 'Bottom', 'Shoes', 'Accessory'];
  const categoryToIdKeyMap = { Top: 'topId', Bottom: 'bottomId', Shoes: 'shoeId', Accessory: 'accessoryId' };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const dateFromQuery = queryParams.get('date');
    const initialDate = dateFromQuery || dayjs().format('YYYY-MM-DD');
    setSelectedDate(initialDate);

    const fetchData = async () => {
      if (currentUser) {
        setLoading(true);
        try {
          const [items, existingOutfit] = await Promise.all([
            getWardrobeItems(currentUser.uid),
            getPlannedOutfit(currentUser.uid, initialDate)
          ]);
          setWardrobe(items);
          if (existingOutfit) {
            setSelectedOutfit({
              topId: existingOutfit.topId || null,
              bottomId: existingOutfit.bottomId || null,
              shoeId: existingOutfit.shoeId || null,
              accessoryId: existingOutfit.accessoryId || null,
            });
          }
        } catch (error) {
          toast.error("Could not load data.");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [currentUser, location.search]);

  const handleItemSelect = (category, itemId) => {
    const key = categoryToIdKeyMap[category];
    if (!key) return;
    setSelectedOutfit(prev => ({ ...prev, [key]: prev[key] === itemId ? null : itemId }));
  };

  const handleSaveOutfit = async () => {
    if (!currentUser || !selectedDate) return;
    if (!Object.values(selectedOutfit).some(id => id !== null)) {
      toast.error("Please select at least one item.");
      return;
    }
    setSaving(true);
    const success = await savePlannedOutfit(currentUser.uid, selectedDate, selectedOutfit);
    setSaving(false);
    if (success) {
      toast.success(`Outfit saved for ${dayjs(selectedDate).format('MMMM D')}`);
      navigate('/calendar');
    }
  };

  const getFilteredItems = (category) => wardrobe.filter(item => item.category === category);
  const getItemById = (itemId) => wardrobe.find(item => item.id === itemId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-50 flex flex-col">
      <div className="md:hidden flex flex-col h-full">
        <header className="sticky top-0 bg-white/80 backdrop-blur-sm z-30 p-4 border-b border-slate-200/80 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-slate-100 text-indigo-600 active:bg-indigo-100 transition-colors" aria-label="Go back">
            <FaArrowLeft className="h-5 w-5" />
          </button>
          <div className="relative flex-1">
            <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none" />
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="pl-10 pr-2 py-2 w-full border border-slate-200 rounded-lg text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"/>
          </div>
        </header>
        <div className="sticky top-[73px] bg-white z-20 border-b border-slate-200">
          <div className="grid grid-cols-4">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`py-3 text-sm font-semibold transition-colors border-b-2 ${activeCategory === cat ? 'text-indigo-600 border-indigo-600' : 'text-slate-500 border-transparent'}`}>{cat}</button>
            ))}
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-4 pb-48 bg-slate-100/50">
          <AnimatePresence mode="wait">
            <motion.div key={activeCategory} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <div className="grid grid-cols-2 gap-4">
                {getFilteredItems(activeCategory).length === 0 ? (
                  <p className="text-slate-500 italic col-span-full text-center py-10">No {activeCategory.toLowerCase()}s in your wardrobe.</p>
                ) : (
                  getFilteredItems(activeCategory).map(item => (
                    <WardrobeItemCard
                      key={item.id}
                      item={item}
                      isSelected={selectedOutfit[categoryToIdKeyMap[activeCategory]] === item.id}
                      onSelect={() => handleItemSelect(activeCategory, item.id)}
                    />
                  ))
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </main>
        
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm z-30 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
           <div className="p-3 flex justify-around items-center border-b border-slate-200">
            {categories.map(cat => {
              const item = getItemById(selectedOutfit[categoryToIdKeyMap[cat]]);
              return (
                <div key={cat} className="w-12 h-12 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center overflow-hidden shadow-inner">
                  {item ? <img src={item.imageURL} alt={item.description} className="w-full h-full object-cover" /> : <FaTshirt className="text-slate-300" />}
                </div>
              );
            })}
          </div>
          <div className="p-3">
             <button onClick={handleSaveOutfit} disabled={saving} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center space-x-2 disabled:opacity-60">
                {saving ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : <FaSave />}
                <span>{saving ? 'Saving...' : 'Save Outfit'}</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="hidden md:block flex-1 py-6 overflow-auto">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-slate-100 hover:bg-indigo-100 text-indigo-600 transition-colors" title="Go Back"><FaArrowLeft size={18} /></button>
              <h1 className="text-3xl font-light text-slate-800">Plan Your <span className="text-indigo-600 font-medium">Outfit</span></h1>
            </div>
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500" />
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {categories.map(category => (
                <div key={category} className="bg-white rounded-xl shadow-md border border-slate-100 p-6">
                  <h3 className="text-lg font-medium mb-4 pb-2 border-b border-slate-100 text-slate-700">{category}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {getFilteredItems(category).length === 0 ? (
                      <p className="text-slate-500 italic col-span-full text-center py-3">No items in this category.</p>
                    ) : (
                      getFilteredItems(category).map(item => (
                        <WardrobeItemCard
                          key={item.id}
                          item={item}
                          isSelected={selectedOutfit[categoryToIdKeyMap[category]] === item.id}
                          onSelect={() => handleItemSelect(category, item.id)}
                        />
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="md:col-span-1">
              <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 sticky top-6">
                <h3 className="text-lg font-medium mb-4 pb-2 border-b border-slate-100 text-slate-800">Outfit for {dayjs(selectedDate).format('MMMM D')}</h3>
                <div className="space-y-4 my-6">
                  {categories.map(category => {
                    const item = getItemById(selectedOutfit[categoryToIdKeyMap[category]]);
                    return (
                      <div key={category} className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-md bg-slate-100 flex items-center justify-center border overflow-hidden">
                          {item ? <img src={item.imageURL} alt={item.description} className="w-full h-full object-cover"/> : <FaTshirt className="text-slate-300"/>}
                        </div>
                        <div className="flex-1"><p className="text-sm font-medium text-slate-700">{category}</p><p className="text-sm text-slate-500">{item ? item.description : 'Not selected'}</p></div>
                      </div>
                    );
                  })}
                </div>
                <button onClick={handleSaveOutfit} disabled={saving} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center space-x-2 disabled:opacity-60">
                    {saving ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : <FaSave />}
                    <span>{saving ? 'Saving...' : 'Save Outfit'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanOutfit;