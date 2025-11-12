'use client';

export default function NewsFilters({ filters, availableFilters, onFilterChange }) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Category Filter */}
      <select
        value={filters.category}
        onChange={(e) => onFilterChange('category', e.target.value)}
        className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
      >
        <option value="">All Categories</option>
        {availableFilters.categories.map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      {/* Source Filter */}
      <select
        value={filters.source}
        onChange={(e) => onFilterChange('source', e.target.value)}
        className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
      >
        <option value="">All Sources</option>
        {availableFilters.sources.slice(0, 50).map((source) => (
          <option key={source} value={source}>{source}</option>
        ))}
      </select>

      {/* Sort By */}
      <select
        value={filters.sortBy}
        onChange={(e) => onFilterChange('sortBy', e.target.value)}
        className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
      >
        <option value="publishedAt">Published Date</option>
        <option value="score">Score</option>
        <option value="viewsCount">Views</option>
        <option value="likesCount">Likes</option>
      </select>

      {/* Sort Order */}
      <button
        onClick={() => onFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
        className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-sm text-white hover:bg-gray-800 transition-colors"
      >
        {filters.sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
      </button>

      {/* Clear Filters */}
      <button
        onClick={() => {
          onFilterChange('category', '');
          onFilterChange('source', '');
          onFilterChange('search', '');
        }}
        className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400 hover:bg-red-500/20 transition-colors"
      >
        Clear Filters
      </button>
    </div>
  );
}
