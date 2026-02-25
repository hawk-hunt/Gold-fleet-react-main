import React from 'react';

/**
 * Premium Button Component
 * Matches the professional styling from the dashboard showcase
 * 
 * Variants: default, primary, success, danger, transparent
 * Sizes: sm, md (default), lg
 */
export default function PremiumButton({
  children,
  variant = 'default',
  size = 'md',
  icon: Icon,
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  const baseStyles = `
    leading-normal inline-flex items-center font-normal
    spark-button-focus rounded-md whitespace-nowrap
    transition-colors duration-100 border-0
    focus-visible:outline-none
  `;

  const sizeStyles = {
    sm: 'h-7 text-sm px-2',
    md: 'h-9 text-sm px-4',
    lg: 'h-10 text-base px-6',
  };

  const variantStyles = {
    default: `
      bg-fill-transparent text-primary dark:text-white
      hover:bg-fill-transparent-hover
      active:bg-fill-transparent-active
      focus-visible:bg-fill-transparent-hover
    `,
    primary: `
      bg-blue-600 dark:bg-blue-500 text-white
      hover:bg-blue-700 dark:hover:bg-blue-600
      active:bg-blue-800 dark:active:bg-blue-700
      focus-visible:bg-blue-700 dark:focus-visible:bg-blue-600
    `,
    success: `
      bg-fill-success text-success-on-bg-fill
      hover:bg-fill-success-hover
      active:bg-fill-success-active
      focus-visible:bg-fill-success-hover
    `,
    danger: `
      bg-red-600 text-white
      hover:bg-red-700
      active:bg-red-800
      focus-visible:bg-red-700
    `,
    transparent: `
      bg-transparent text-primary dark:text-white
      hover:text-primary-dark dark:hover:text-blue-300
      border border-gray-300 dark:border-gray-600
      hover:border-primary dark:hover:border-blue-400
    `,
  };

  const disabledStyles = disabled 
    ? 'opacity-50 cursor-not-allowed pointer-events-none' 
    : 'cursor-pointer';

  const buttonClass = `
    ${baseStyles}
    ${sizeStyles[size]}
    ${variantStyles[variant]}
    ${disabledStyles}
    ${className}
  `;

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={buttonClass}
    >
      {Icon && !loading && <Icon className="w-4 h-4 mr-2" />}
      {loading && (
        <svg className="animate-spin w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
}
