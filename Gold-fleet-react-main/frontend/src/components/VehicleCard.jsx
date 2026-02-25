import React from 'react';

/**
 * Vehicle Card Component
 * Displays vehicle info with car image in gold & cream theme
 */
const VehicleCard = ({ 
  vehicle = {}, 
  onAddClick, 
  imageUrl = 'https://via.placeholder.com/400x300?text=Vehicle',
  title = 'Fleet Vehicle',
  subtitle = 'Click to add or view',
  showButton = true,
  buttonText = 'Add Vehicle'
}) => {
  return (
    <div className="relative flex-grow flex items-center justify-center rounded-lg shadow-lg overflow-hidden"
         style={{ background: 'linear-gradient(135deg, #FFE4B5 0%, #FFFAF0 100%)' }}>
      
      {/* Car Image Background */}
      <img 
        alt={title} 
        className="absolute inset-0 w-full h-full object-cover opacity-70" 
        src={imageUrl}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-amber-900/40 via-amber-900/20 to-transparent"></div>
      
      {/* Content Container */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        {/* Title Section */}
        <div className="text-center mb-4">
          <h3 className="text-2xl font-bold text-amber-950">{title}</h3>
          <p className="text-sm text-amber-800 mt-1">{subtitle}</p>
        </div>

        {/* Vehicle Details Box - if available */}
        {vehicle?.make && (
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 mb-4 shadow-lg"
               style={{ borderLeft: '4px solid #FFD700' }}>
            <p className="text-sm font-semibold text-amber-900">
              {vehicle.make} {vehicle.model}
            </p>
            <p className="text-xs text-amber-700 mt-1">{vehicle.vin || 'Vehicle Info'}</p>
          </div>
        )}

        {/* Action Button */}
        {showButton && (
          <button
            onClick={onAddClick}
            className="px-6 py-2.5 rounded-lg font-semibold text-white transition-all hover:shadow-lg active:scale-95"
            style={{ 
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
            }}
          >
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
};

export default VehicleCard;
