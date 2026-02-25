import Card from './Card';

/**
 * StatCardsGrid Component
 * Displays a grid of stat cards with loading and animation states
 * Props:
 *   stats - array of stat objects: { icon, title, value, description, trend }
 *   loading - show loading skeleton
 *   cols - responsive column configuration
 */
export default function StatCardsGrid({
  stats = [],
  loading = false,
  cols = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
}) {
  if (loading) {
    return (
      <div className={`grid ${cols} gap-4 w-full`}>
        {[...Array(4)].map((_, i) => (
          <Card key={i} loading={true} />
        ))}
      </div>
    );
  }

  return (
    <div className={`grid ${cols} gap-4 w-full`}>
      {stats.map((stat, idx) => (
        <Card
          key={idx}
          icon={stat.icon}
          title={stat.title}
          subtitle={stat.subtitle}
          className={stat.className}
        >
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</p>
              {stat.description && (
                <p className="mt-1 text-sm text-gray-500">{stat.description}</p>
              )}
            </div>
            {stat.trend && (
              <div
                className={`text-sm font-semibold px-2 py-1 rounded ${
                  stat.trend.positive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {stat.trend.positive ? '↑' : '↓'} {stat.trend.percentage}%
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
