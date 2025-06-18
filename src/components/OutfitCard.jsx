import dayjs from 'dayjs';
import { FaHeart, FaRegHeart, FaTrash } from 'react-icons/fa';

const OutfitCard = ({ outfit, wardrobeItems, onToggleFavorite, onDeleteOutfit, isFavorite }) => {
  const getItemDetails = (itemId) => {
    return wardrobeItems.find(item => item.id === itemId);
  };

  const outfitDetails = {
    top: getItemDetails(outfit.topId),
    bottom: getItemDetails(outfit.bottomId),
    shoe: getItemDetails(outfit.shoeId),
    accessory: getItemDetails(outfit.accessoryId),
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-blue-50 flex justify-between items-center">
        <h3 className="font-semibold text-lg text-blue-800">
          Outfit for {outfit.date ? dayjs(outfit.date).format('MMM DD, YYYY') : 'N/A'}
        </h3>
      </div>
      <div className="p-4 grid grid-cols-2 gap-3 flex-grow">
        {Object.entries(outfitDetails).map(([category, item]) => (
          <div key={category} className="text-center">
            <p className="font-medium text-gray-600 capitalize mb-1">{category}</p>
            {item ? (
              <div className="bg-gray-100 rounded-md overflow-hidden">
                <img
                  src={item.imageURL || 'https://via.placeholder.com/60'}
                  alt={item.description || item.category}
                  className="w-full h-20 object-cover object-center"
                />
                <p className="text-xs p-1 truncate">{item.description || item.category}</p>
              </div>
            ) : (
              <div className="bg-gray-100 border border-dashed border-gray-300 rounded-md h-20 flex items-center justify-center text-gray-400 text-xs">
                No {category}
              </div>
            )}
          </div>
        ))}
      </div>
      {outfit.plannedAt && (
        <div className="p-2 text-right text-xs text-gray-500 border-t bg-gray-50">
          Planned: {dayjs(outfit.plannedAt.toDate()).format('MMM DD, YYYY')}
        </div>
      )}
      <div className="flex justify-between items-center p-4 bg-gray-50">
        {onToggleFavorite && (
          <button
            onClick={() => onToggleFavorite(outfit)}
            className="flex items-center text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
            title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          >
            {isFavorite ? (
              <FaHeart className="text-red-500 mr-2" />
            ) : (
              <FaRegHeart className="text-gray-500 mr-2" />
            )}
            {isFavorite ? 'Favorited' : 'Add to Favorites'}
          </button>
        )}
        {onDeleteOutfit && (
          <button
            onClick={() => window.confirm("Are you sure you want to delete this outfit? This action cannot be undone.") && onDeleteOutfit(outfit.id)}
            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            title="Delete outfit"
          >
            <FaTrash size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default OutfitCard;