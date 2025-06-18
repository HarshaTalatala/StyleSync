import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { uploadWardrobeItem, getWardrobeItems, deleteWardrobeItem } from '../services/wardrobeService';
import toast from 'react-hot-toast';
import { FaPlus, FaTshirt, FaTags, FaTrash, FaArrowLeft, FaTimes, FaEllipsisV } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const categories = ['Top', 'Bottom', 'Shoes', 'Accessory'];
const commonTags = ['Casual', 'Formal', 'Sporty', 'Summer', 'Winter', 'Spring', 'Autumn'];
const colors = ['Red', 'Blue', 'Green', 'Yellow', 'Black', 'White', 'Gray', 'Brown', 'Purple', 'Pink'];

const WardrobeItemCard = ({ item, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (window.confirm("Are you sure you want to delete this item?")) {
        onDelete(item.id, item.imageURL);
    }
  };
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col group">
      <div className="relative h-48 sm:h-56 overflow-hidden">
        <img src={item.imageURL} alt={item.description} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <button onClick={() => setMenuOpen(!menuOpen)} className="absolute top-2 right-2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition-colors z-10">
          <FaEllipsisV size={14} />
        </button>
        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-12 right-2 bg-white rounded-lg shadow-xl py-1 z-20">
              <button onClick={handleDeleteClick} className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                <FaTrash /> Delete
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-slate-800">{item.category}</h3>
          {item.color && <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">{item.color}</span>}
        </div>
        <p className="text-sm text-slate-600 mt-1 mb-3 flex-grow">{item.description || 'No description'}</p>
        {item.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
            {item.tags.map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const AddItemModal = ({ isOpen, onClose, onSubmit, uploading }) => {
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm();
  const imageFile = watch('image');
  const [dragActive, setDragActive] = useState(false);

  const handleFormSubmit = (data) => {
    onSubmit(data).then(() => {
      reset();
    });
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setValue('image', [e.dataTransfer.files[0]]);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-auto flex flex-col max-h-[96vh] overflow-hidden focus:outline-none border border-slate-200" role="dialog" aria-modal="true" aria-labelledby="addItemModalTitle">
            <header className="p-7 flex items-center justify-between border-b bg-white flex-shrink-0">
              <h2 id="addItemModalTitle" className="text-2xl font-bold text-slate-800 tracking-tight">Add New Wardrobe Item</h2>
              <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200" aria-label="Close modal"><FaTimes size={20} /></button>
            </header>
            <form onSubmit={handleSubmit(handleFormSubmit)} className="flex-1 overflow-y-auto px-8 py-7 space-y-8" autoComplete="off"
              onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}>
              <div>
                <label htmlFor="itemImageDesktop" className="block text-slate-700 text-base font-semibold mb-2">Image <span className="text-red-500">*</span></label>
                <div className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors duration-200 ${dragActive ? 'border-indigo-400 bg-indigo-50' : errors.image ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:border-indigo-300'}`}
                  tabIndex={0} aria-label="Image upload area">
                  <input type="file" {...register('image', { required: 'Image is required' })} accept="image/*" className="hidden" id="itemImageDesktop" />
                  <label htmlFor="itemImageDesktop" className="cursor-pointer block focus:outline-none focus:ring-2 focus:ring-indigo-200">
                    {imageFile?.[0] ? (
                      <img src={URL.createObjectURL(imageFile[0])} alt="Preview" className="h-48 mx-auto object-contain mb-2 rounded shadow-lg border border-slate-200" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-32">
                        <span className="text-2xl text-indigo-400 mb-2"><FaPlus /></span>
                        <span className="text-slate-400">Click or drag an image here to upload</span>
                      </div>
                    )}
                  </label>
                  {errors.image && <p className="text-xs text-red-500 mt-2">{errors.image.message}</p>}
                </div>
                <p className="text-xs text-slate-500 mt-1">Supported: JPG, PNG, GIF. Max size: 5MB.</p>
              </div>
              <hr className="my-2 border-slate-100" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block text-slate-700 text-base font-semibold mb-2">Category <span className="text-red-500">*</span></label>
                  <select id="category" {...register('category', { required: 'Category is required' })} className={`w-full rounded-lg border bg-white py-2.5 px-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition ${errors.category ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}> 
                    <option value="">Select a category</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  {errors.category && <p className="text-xs text-red-500 mt-2">{errors.category.message}</p>}
                </div>
                <div>
                  <label htmlFor="color" className="block text-slate-700 text-base font-semibold mb-2">Color</label>
                  <select id="color" {...register('color')} className="w-full rounded-lg border border-slate-200 bg-white py-2.5 px-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition">
                    <option value="">Select a color</option>
                    {colors.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="description" className="block text-slate-700 text-base font-semibold mb-2">Description</label>
                <textarea id="description" {...register('description')} rows="2" className="w-full rounded-lg border border-slate-200 bg-white py-2.5 px-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition" placeholder="e.g., Blue denim jacket" />
                <p className="text-xs text-slate-500 mt-1">Optional. Add details to help identify the item.</p>
              </div>
              <div>
                <label className="block text-slate-700 text-base font-semibold mb-2">Tags</label>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Tags">
                  {commonTags.map(tag => (
                    <label key={tag} className="flex items-center space-x-2 border border-slate-200 px-3 py-1.5 rounded-full text-sm text-slate-700 hover:bg-white hover:border-indigo-200 transition-colors bg-white shadow-sm has-[:checked]:bg-indigo-50 has-[:checked]:border-indigo-300">
                      <input type="checkbox" value={tag} {...register('tags')} className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" />
                      <span>{tag}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-1">Optional. Select all that apply.</p>
              </div>
            </form>
            <footer className="p-7 bg-white/80 backdrop-blur-sm border-t flex-shrink-0">
              <button type="submit" onClick={handleSubmit(handleFormSubmit)} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg flex items-center justify-center space-x-2 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-indigo-200 text-lg" disabled={uploading}>
                {uploading ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : <FaPlus />}
                <span>{uploading ? 'Uploading...' : 'Add to Wardrobe'}</span>
              </button>
            </footer>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Wardrobe = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [wardrobe, setWardrobe] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  const fetchWardrobe = useCallback(async () => {
    if (!currentUser) return;
    const items = await getWardrobeItems(currentUser.uid);
    setWardrobe(items);
    setLoading(false);
  }, [currentUser]);

  useEffect(() => {
    fetchWardrobe();
  }, [fetchWardrobe]);

  const onSubmit = async (data) => {
    if (!currentUser) return toast.error("You must be logged in.");
    setUploading(true);
    const success = await uploadWardrobeItem(currentUser.uid, data, data.image[0]);
    if (success) {
      toast.success("Item added successfully!");
      setShowFormModal(false);
      await fetchWardrobe();
    }
    setUploading(false);
  };

  const handleDelete = async (itemId, imageURL) => {
    if (!currentUser) return;
    const success = await deleteWardrobeItem(currentUser.uid, itemId, imageURL);
    if (success) {
      toast.success("Item deleted.");
      setWardrobe(prev => prev.filter(item => item.id !== itemId)); // Optimistic UI update
    }
  };

  const filteredWardrobe = activeFilter === 'All'
    ? wardrobe
    : wardrobe.filter(item => item.category === activeFilter);
  
  const filterCategories = ['All', ...categories];

  return (
    <div className="h-screen bg-slate-50 flex flex-col">
      <AddItemModal isOpen={showFormModal} onClose={() => setShowFormModal(false)} onSubmit={onSubmit} uploading={uploading} />
      
      <header className="md:hidden sticky top-0 bg-white/80 backdrop-blur-sm z-30">
        <div className="p-4 flex items-center gap-3 border-b border-slate-200">
            <button onClick={() => navigate('/dashboard')} className="p-2 rounded-full bg-slate-100 text-indigo-600" aria-label="Go back"><FaArrowLeft className="h-5 w-5" /></button>
            <h1 className="text-lg font-bold text-slate-800">My Wardrobe</h1>
        </div>
        <div className="px-2 border-b border-slate-200 overflow-x-auto whitespace-nowrap">
            {filterCategories.map(cat => (
                <button key={cat} onClick={() => setActiveFilter(cat)} className={`inline-block px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 ${activeFilter === cat ? 'text-indigo-600 border-indigo-600' : 'text-slate-500 border-transparent'}`}>
                    {cat}
                </button>
            ))}
        </div>
      </header>
      
      <div className="hidden md:flex justify-between items-center p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="p-2 rounded-full bg-slate-100 text-indigo-600 hover:bg-indigo-100"><FaArrowLeft size={18} /></button>
            <h1 className="text-3xl font-light text-slate-800">Your <span className="text-indigo-600 font-medium">Wardrobe</span></h1>
        </div>
        <button onClick={() => setShowFormModal(true)} className="px-4 py-2 rounded-lg flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm">
            <FaPlus size={14} /> Add Item
        </button>
      </div>
      
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        {loading ? (
            <div className="text-center py-10 text-slate-500">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
            </div>
        ) : filteredWardrobe.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl border border-slate-100 shadow-sm">
              <FaTshirt className="text-5xl text-slate-300 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-700">No Items Found</h3>
              <p className="text-slate-500 text-sm">
                {activeFilter === 'All' ? 'Your wardrobe is empty. Add your first item!' : `You have no items in the "${activeFilter}" category.`}
              </p>
            </div>
        ) : (
            <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <AnimatePresence>
                {filteredWardrobe.map(item => <WardrobeItemCard key={item.id} item={item} onDelete={handleDelete} />)}
              </AnimatePresence>
            </motion.div>
        )}
      </main>

      <div className="md:hidden fixed bottom-20 right-4 z-40">
        <button onClick={() => setShowFormModal(true)} className="w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform">
          <FaPlus size={20} />
        </button>
      </div>
    </div>
  );
};

export default Wardrobe;