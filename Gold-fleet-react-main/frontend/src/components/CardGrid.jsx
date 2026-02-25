/**
 * Responsive CardGrid Component
 * Automatically responsive grid layout for cards
 * Props:
 *   children - Card components or content
 *   gap - space between cards (default: 'gap-4')
 *   cols - responsive column configuration
 *   className - additional classes
 */
export default function CardGrid({
  children,
  gap = 'gap-4',
  cols = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  className = '',
}) {
  return (
    <div
      className={`
        grid ${cols} ${gap} w-full auto-rows-max
        ${className}
      `}
    >
      {children}
    </div>
  );
}
