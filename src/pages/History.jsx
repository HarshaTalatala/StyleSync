import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllPlannedOutfits, addFavoriteOutfit, getFavoriteOutfits, removeFavoriteOutfit, deletePlannedOutfit } from '../services/plannerService';
import { getWardrobeItems } from '../services/wardrobeService';
import OutfitCard from '../components/OutfitCard';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaClone, FaStar } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmDialog from '../components/ConfirmDialog';
import toast from 'react-hot-toast';

const History = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [allOutfits, setAllOutfits] = useState([]);  const [favoriteOutfits, setFavoriteOutfits] = useState([]);
  const [wardrobeItems, setWardrobeItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    outfitId: null
  });

  const tabs = [
    { id: 'all', label: 'All Outfits' },
    { id: 'favorites', label: 'Favorites' }
  ];

  const fetchOutfits = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
        const [outfits, favorites, wardrobe] = await Promise.all([
            getAllPlannedOutfits(currentUser.uid),
            getFavoriteOutfits(currentUser.uid),
            getWardrobeItems(currentUser.uid)
        ]);
        const sortedOutfits = outfits.sort((a, b) => new Date(b.date) - new Date(a.date));
        setAllOutfits(sortedOutfits);
        setFavoriteOutfits(favorites);
        setWardrobeItems(wardrobe);
    } catch (error) {
        // Optionally show a toast or set an error state
    } finally {
        setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchOutfits();
  }, [fetchOutfits]);

  const isOutfitFavorite = (outfit) => {
    return favoriteOutfits.some(fav =>
      fav.date === outfit.date &&
      fav.topId === outfit.topId &&
      fav.bottomId === outfit.bottomId &&
      fav.shoeId === outfit.shoeId &&
      fav.accessoryId === outfit.accessoryId
    );
  };

  const handleToggleFavorite = async (outfit) => {
    if (!currentUser) return;
    const isFavorite = isOutfitFavorite(outfit);
    const action = isFavorite ? removeFavoriteOutfit : addFavoriteOutfit;
    const success = await action(currentUser.uid, outfit);
    if (success) {
      await fetchOutfits();
      toast.success(isFavorite ? 'Removed from favorites!' : 'Added to favorites!');
    }
  };  const handleDeleteRequest = (outfitId) => {
    setConfirmDialog({
      isOpen: true,
      outfitId: outfitId
    });
  };
  
  const handleDeleteOutfit = async () => {
    if (!currentUser || !confirmDialog.outfitId) return;
    // Find the outfit data by id
    const outfit = allOutfits.find(o => o.id === confirmDialog.outfitId);
    const success = await deletePlannedOutfit(currentUser.uid, confirmDialog.outfitId);
    if (success) {
      setAllOutfits(prev => prev.filter(o => o.id !== confirmDialog.outfitId));
      // Also remove from favorites if it exists
      if (outfit) {
        await removeFavoriteOutfit(currentUser.uid, outfit);
        await fetchOutfits();
      }
      toast.success('Outfit deleted!');
    }
  };

  const outfitsToDisplay = activeTab === 'all' ? allOutfits : favoriteOutfits;

  return (
    <div className="h-screen bg-slate-50 flex flex-col">
      <header className="md:hidden sticky top-0 bg-white/80 backdrop-blur-sm z-30 p-4 flex items-center gap-3 border-b border-slate-200">
        <button onClick={() => navigate('/dashboard')} className="p-2 rounded-full bg-slate-100 text-indigo-600" aria-label="Go back">
          <FaArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold text-slate-800">History & Favorites</h1>
      </header>
      
      <div className="hidden md:flex items-center p-6 border-b border-slate-200">
        <button onClick={() => navigate('/dashboard')} className="p-2 rounded-full bg-slate-100 text-indigo-600 hover:bg-indigo-100 transition-colors mr-4" title="Go Back">
          <FaArrowLeft size={18} />
        </button>
        <h1 className="text-3xl font-light text-slate-800">Outfit <span className="text-indigo-600 font-medium">History</span></h1>
      </div>
      
      <div className="sticky top-[73px] md:top-auto bg-slate-50 md:bg-transparent p-2 md:p-0 md:my-6 z-20">
        <div className="w-full max-w-sm mx-auto bg-slate-200/80 rounded-lg p-1 grid grid-cols-2 gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full py-2 text-sm font-semibold rounded-md transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'bg-transparent text-slate-600 hover:bg-slate-300/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      <main className="flex-1 overflow-y-auto px-4 pb-4 md:px-6 md:pb-6">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : outfitsToDisplay.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-xl border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {activeTab === 'all'
                ? <FaClone className="text-3xl text-slate-400" />
                : <FaStar className="text-3xl text-slate-400" />
              }
            </div>
            <h3 className="font-semibold text-slate-700">
              {activeTab === 'all' ? 'No Outfit History' : 'No Favorites Yet'}
            </h3>
            <p className="text-sm text-slate-500">
              {activeTab === 'all'
                ? 'Plan an outfit in the calendar to see it here.'
                : 'Tap the star on an outfit to save it as a favorite.'
              }
            </p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <AnimatePresence>
              {outfitsToDisplay.map((outfit) => (                <OutfitCard
                  key={outfit.id}
                  outfit={outfit}
                  wardrobeItems={wardrobeItems}
                  onToggleFavorite={() => handleToggleFavorite(outfit)}
                  isFavorite={isOutfitFavorite(outfit)}
                  onDeleteOutfit={activeTab === 'all' ? handleDeleteRequest : undefined}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}      </main>
      
      {/* Confirm Dialog for Outfit Deletion */}
      <ConfirmDialog 
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({...confirmDialog, isOpen: false})}
        onConfirm={handleDeleteOutfit}
        title="Delete Outfit"
        message="Are you sure you want to delete this outfit? This action cannot be undone."
      />
    </div>
  );
};

export default History;