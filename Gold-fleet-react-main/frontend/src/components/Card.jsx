import React from 'react';
import { HiEllipsisHorizontal } from 'react-icons/hi2';

/**
 * Enhanced Responsive Card Component with Premium Styling
 * Features: Dark mode, smooth animations, action menu, draggable support
 * Props:
 *   title - card title
 *   subtitle - optional subtitle or description
 *   icon - optional icon component
 *   children - card content
 *   footer - optional footer content
 *   onClick - optional click handler
 *   onActionClick - action menu handler
 *   className - additional Tailwind classes
 *   loading - show loading skeleton
 *   draggable - enable drag handle styling
 *   headerBackground - custom header background
 */
export default function Card({
  title,
  subtitle,
  icon,
  children,
  footer,
  onClick,
  onActionClick,
  className = '',
  loading = false,
  draggable = false,
  headerBackground = false,
}) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white dark:bg-gray-950 rounded-lg shadow transition-shadow duration-100 ease-in-out
        border border-solid border-transparent hover:shadow-md 
        dark:border-gray-900 overflow-hidden
        ${onClick ? 'cursor-pointer' : ''}
        ${draggable ? 'group ui-draggable ui-resizable' : ''}
        ${className}
      `}
    >
      {/* Card header */}
      {(title || subtitle || icon || onActionClick) && (
        <div className={`px-6 py-4 border-b border-gray-100 dark:border-gray-800 ${
          draggable ? 'grid-stack-drag-area spark-stack-item' : ''
        } ${headerBackground ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800' : ''}`}
        draggable={draggable}>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {icon && <div className="flex-shrink-0 text-2xl text-primary dark:text-blue-400">{icon}</div>}
              <div className="min-w-0">
                {title && (
                  <h3 className="break-words max-w-full text-lg text-primary dark:text-white text-left font-semibold normal-case font-sans m-0 leading-6 w-fit">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400 truncate">{subtitle}</p>
                )}
              </div>
            </div>
            
            {/* Action Menu */}
            {onActionClick && (
              <div className="flex gap-x-3 self-start items-center justify-end ml-2">
                <div className="pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-100 
                  bg-[linear-gradient(to_right,transparent_0%,rgba(255,255,255,0.9)_25%)] 
                  dark:bg-[linear-gradient(to_right,transparent_0%,theme('colors.gray.950')_25%)]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onActionClick();
                    }}
                    className="leading-normal inline-flex items-center font-normal h-7 text-sm px-3
                      bg-fill-transparent border-0 text-primary dark:text-white
                      hover:text-primary hover:bg-fill-transparent-hover
                      active:bg-fill-transparent-active
                      focus-visible:bg-fill-transparent-hover
                      rounded-md whitespace-nowrap
                      transition-colors duration-100"
                    type="button"
                  >
                    <HiEllipsisHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Card content */}
      <div className={`px-6 py-4 ${draggable ? 'dashboard-widget-scroll-shadow grow spark-stack-item' : ''}`}>
        {loading ? (
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
          </div>
        ) : (
          children
        )}
      </div>

      {/* Card footer */}
      {footer && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
          {footer}
        </div>
      )}
    </div>
  );
}
