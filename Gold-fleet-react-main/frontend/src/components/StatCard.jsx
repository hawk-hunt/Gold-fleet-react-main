import React from 'react';

/**
 * Generic statistic card used across dashboards.
 * Props:
 *   icon - React node for the leading icon
 *   title - string heading
 *   value - primary value display (number or string)
 *   description - small text below value
 *   children - optional extra content (e.g. details toggle)
 *   onClick - callback when card is clicked (makes card interactive)
 */
const StatCard = ({ icon, title, value, description, children, onClick, variant = 'default' }) => {
  const clickable = typeof onClick === 'function';
  
  // Gold and cream color variants
  const variants = {
    default: 'bg-white',
    gold: 'bg-gradient-to-br from-yellow-50 to-amber-50',
    cream: 'bg-gradient-to-br from-amber-50 to-yellow-50',
    goldDark: 'bg-gradient-to-br from-yellow-100 to-amber-100'
  };

  return (
    <div
      onClick={onClick}
      className={
        `${variants[variant]} rounded-lg shadow-md p-6 flex flex-col justify-between transition-all hover:shadow-lg border border-amber-100 ` +
        (clickable ? 'cursor-pointer' : '')
      }
    >
      <div className="flex items-start space-x-4">
        {icon && <div className="text-3xl text-yellow-600 flex-shrink-0">{icon}</div>}
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
        </div>
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};

export default StatCard;
