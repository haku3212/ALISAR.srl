import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';

const SearchBar = ({
  placeholder = 'Buscar...',
  onSearch,
  onFilterChange,
  filters = [],
  debounceMs = 300
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [debounceTimer, setDebounceTimer] = useState(null);

  useEffect(() => {
    if (debounceTimer) clearTimeout(debounceTimer);

    const timer = setTimeout(() => {
      onSearch(searchTerm);
    }, debounceMs);

    setDebounceTimer(timer);

    return () => clearTimeout(timer);
  }, [searchTerm, onSearch, debounceMs]);

  const handleFilterChange = (filterId, value) => {
    const updatedFilters = { ...activeFilters, [filterId]: value };
    setActiveFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const hasActiveFilters = Object.values(activeFilters).some(v => v);

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Barra de búsqueda principal */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: filters.length > 0 ? '16px' : '0' }}>
        <div style={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Search size={18} color="#666" style={{ position: 'absolute', left: '12px' }} />
          <input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '40px',
              paddingRight: '12px',
              paddingTop: '10px',
              paddingBottom: '10px',
              borderRadius: '8px',
              border: '1px solid #1f241f',
              background: '#111411',
              color: '#e0e0e0',
              outline: 'none',
              boxSizing: 'border-box',
              fontSize: '14px',
              transition: 'border-color 0.2s'
            }}
          />
        </div>

        {/* Botón de filtros */}
        {filters.length > 0 && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: hasActiveFilters ? '1px solid #FFD700' : '1px solid #1f241f',
              background: hasActiveFilters ? '#1a221a' : '#111411',
              color: hasActiveFilters ? '#FFD700' : '#999',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: hasActiveFilters ? '600' : '400',
              transition: 'all 0.2s'
            }}
          >
            <Filter size={16} />
            Filtros
            <ChevronDown size={14} style={{ transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
          </button>
        )}
      </div>

      {/* Panel de filtros avanzados */}
      {showFilters && filters.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          padding: '16px',
          background: '#111411',
          borderRadius: '8px',
          border: '1px solid #1f241f'
        }}>
          {filters.map(filter => (
            <div key={filter.id}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                color: '#999',
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'uppercase'
              }}>
                {filter.label}
              </label>
              {filter.type === 'select' ? (
                <select
                  value={activeFilters[filter.id] || ''}
                  onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #1f241f',
                    background: '#0d0f0d',
                    color: '#e0e0e0',
                    outline: 'none',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">Todos</option>
                  {filter.options.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : filter.type === 'range' ? (
                <div>
                  <input
                    type="range"
                    min={filter.min}
                    max={filter.max}
                    value={activeFilters[filter.id] || filter.min}
                    onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                    style={{
                      width: '100%',
                      cursor: 'pointer'
                    }}
                  />
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '6px',
                    fontSize: '12px',
                    color: '#999'
                  }}>
                    <span>{filter.min}</span>
                    <span style={{ color: '#FFD700', fontWeight: '600' }}>
                      {activeFilters[filter.id] || filter.min}
                    </span>
                    <span>{filter.max}</span>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
