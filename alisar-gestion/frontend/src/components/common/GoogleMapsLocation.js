/**
 * GoogleMapsLocation.js
 * Componente para seleccionar ubicación usando Google Maps
 * Permite al usuario buscar y seleccionar una ubicación en el mapa
 * Integración con Google Maps API y Geocoding
 */

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, X } from 'lucide-react';

/**
 * Componente GoogleMapsLocation
 * Proporciona interfaz para buscar y seleccionar ubicación
 * Guarda las coordenadas y dirección seleccionadas
 *
 * @param {Object} props - Propiedades del componente
 * @param {string} props.address - Dirección actual
 * @param {Object} props.coordinates - Coordenadas {lat, lng}
 * @param {Function} props.onLocationChange - Callback cuando cambia la ubicación
 * @param {boolean} props.disabled - Si está deshabilitado
 * @param {string} props.label - Etiqueta del campo
 * @param {string} props.placeholder - Placeholder del input
 */
const GoogleMapsLocation = ({
  address = '',
  coordinates = { lat: -14.8391, lng: -65.3672 }, // Riberalta, Bolivia por defecto
  onLocationChange,
  disabled = false,
  label = 'Ubicación (Google Maps)',
  placeholder = 'Buscar ubicación...'
}) => {
  /**
   * Estados del componente
   */
  const [searchInput, setSearchInput] = useState(address);
  const [showMap, setShowMap] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // Nota: Para usar Google Maps, necesitas:
  // 1. Instalar: npm install @react-google-maps/api
  // 2. Configurar API key en .env: REACT_APP_GOOGLE_MAPS_API_KEY
  // 3. Habilitar Geocoding API en Google Cloud Console

  /**
   * Simula la búsqueda de direcciones
   * En producción, usarías Google Places API
   * @param {string} searchTerm - Término de búsqueda
   */
  const handleSearch = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      return;
    }

    setLoading(true);

    // Simulación de búsqueda - En producción usar Google Places API
    try {
      // Este es un placeholder - en producción usarías:
      // const results = await fetch(
      //   `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${searchTerm}&key=${GOOGLE_MAPS_KEY}`
      // );

      // Por ahora, simulamos algunas ubicaciones de ejemplo
      const mockSuggestions = [
        { address: searchTerm + ', Riberalta, Beni, Bolivia', lat: -14.8391, lng: -65.3672 },
        { address: searchTerm + ', La Paz, Bolivia', lat: -16.5, lng: -68.15 },
        { address: searchTerm + ', Santa Cruz, Bolivia', lat: -17.8, lng: -63.18 },
      ];

      setSuggestions(mockSuggestions);
    } catch (error) {
      console.error('Error en búsqueda de ubicación:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Selecciona una ubicación de las sugerencias
   * @param {Object} location - Ubicación seleccionada
   */
  const handleSelectLocation = (location) => {
    setSearchInput(location.address);
    setSuggestions([]);

    // Notificar al padre del cambio
    if (onLocationChange) {
      onLocationChange({
        address: location.address,
        coordinates: {
          lat: location.lat,
          lng: location.lng
        }
      });
    }

    // Actualizar mapa
    if (mapRef.current) {
      updateMapLocation(location.lat, location.lng);
    }
  };

  /**
   * Actualiza la ubicación del mapa
   * @param {number} lat - Latitud
   * @param {number} lng - Longitud
   */
  const updateMapLocation = (lat, lng) => {
    // Esta función se actualizará cuando Google Maps esté integrado
  };

  /**
   * Abre/cierra el modal del mapa
   */
  const toggleMapModal = () => {
    setShowMap(!showMap);
  };

  /**
   * Limpia la búsqueda y ubicación
   */
  const clearLocation = () => {
    setSearchInput('');
    setSuggestions([]);
    if (onLocationChange) {
      onLocationChange({
        address: '',
        coordinates: { lat: -14.8391, lng: -65.3672 }
      });
    }
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ETIQUETA */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <label style={{
        display: 'block',
        marginBottom: '8px',
        color: '#ffffff',
        fontSize: '14px',
        fontWeight: '500'
      }}>
        <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
        {label}
      </label>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* CONTENEDOR DE ENTRADA */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'stretch',
        marginBottom: '8px'
      }}>
        {/* Input de búsqueda */}
        <div style={{
          flex: 1,
          position: 'relative'
        }}>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              handleSearch(e.target.value);
            }}
            disabled={disabled}
            placeholder={placeholder}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '10px',
              border: '1px solid #333333',
              background: '#1a1a1a',
              color: '#ffffff',
              outline: 'none',
              fontSize: '14px',
              transition: 'border-color 0.2s',
              opacity: disabled ? 0.5 : 1
            }}
            onFocus={() => searchInput && setSuggestions([])}
          />

          {/* Sugerencias de búsqueda */}
          {suggestions.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: '#252525',
              border: '1px solid #333333',
              borderTop: 'none',
              borderRadius: '0 0 10px 10px',
              maxHeight: '200px',
              overflowY: 'auto',
              zIndex: 1000
            }}>
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectLocation(suggestion)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: idx < suggestions.length - 1 ? '1px solid #333333' : 'none',
                    color: '#cccccc',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '13px',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#1a1a1a'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  <MapPin size={12} style={{ display: 'inline', marginRight: '6px' }} />
                  {suggestion.address}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Botón para limpiar */}
        {searchInput && (
          <button
            onClick={clearLocation}
            disabled={disabled}
            style={{
              background: 'transparent',
              border: '1px solid #333333',
              color: '#f87171',
              padding: '10px 12px',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s',
              opacity: disabled ? 0.5 : 1
            }}
            title="Limpiar ubicación"
          >
            <X size={16} />
          </button>
        )}

        {/* Botón para abrir mapa */}
        <button
          onClick={toggleMapModal}
          disabled={disabled}
          style={{
            background: '#FFD700',
            color: '#000000',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.15s',
            opacity: disabled ? 0.5 : 1
          }}
          title="Abrir mapa"
        >
          <MapPin size={16} /> Mapa
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* TEXTO DE UBICACIÓN SELECCIONADA */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {searchInput && (
        <div style={{
          fontSize: '12px',
          color: '#999999',
          padding: '4px 8px',
          background: '#252525',
          borderRadius: '6px',
          marginBottom: '8px'
        }}>
          📍 {searchInput}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* MODAL DEL MAPA */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {showMap && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(0, 0, 0, 0.7)',
          backdrop: 'blur(4px)',
          display: 'grid',
          placeItems: 'center',
          padding: '24px'
        }}>
          <div style={{
            background: '#1a1a1a',
            border: '1px solid #333333',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.45)'
          }}>
            {/* Encabezado */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              paddingBottom: '16px',
              borderBottom: '1px solid #333333'
            }}>
              <h3 style={{
                margin: 0,
                color: '#FFD700',
                fontSize: '18px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <MapPin size={20} /> Seleccionar Ubicación
              </h3>
              <button
                onClick={toggleMapModal}
                style={{
                  background: 'transparent',
                  border: '1px solid #333333',
                  color: '#cccccc',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '18px'
                }}
              >
                ✕
              </button>
            </div>

            {/* Área del mapa (placeholder) */}
            <div
              ref={mapContainerRef}
              style={{
                width: '100%',
                height: '400px',
                background: '#252525',
                borderRadius: '12px',
                border: '1px solid #333333',
                marginBottom: '16px',
                display: 'grid',
                placeItems: 'center',
                color: '#999999',
                fontSize: '14px'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <MapPin size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
                <p style={{ margin: 0 }}>
                  Google Maps se cargará aquí
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666666' }}>
                  Requiere API key configurada
                </p>
              </div>
            </div>

            {/* Información de coordenadas */}
            {coordinates && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '11px',
                    color: '#999999',
                    textTransform: 'uppercase',
                    marginBottom: '4px',
                    fontWeight: '600'
                  }}>
                    Latitud
                  </label>
                  <input
                    type="text"
                    value={coordinates.lat}
                    readOnly
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #333333',
                      background: '#252525',
                      color: '#FFD700',
                      fontSize: '13px',
                      fontFamily: "'JetBrains Mono', monospace"
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '11px',
                    color: '#999999',
                    textTransform: 'uppercase',
                    marginBottom: '4px',
                    fontWeight: '600'
                  }}>
                    Longitud
                  </label>
                  <input
                    type="text"
                    value={coordinates.lng}
                    readOnly
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #333333',
                      background: '#252525',
                      color: '#FFD700',
                      fontSize: '13px',
                      fontFamily: "'JetBrains Mono', monospace"
                    }}
                  />
                </div>
              </div>
            )}

            {/* Botones */}
            <div style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={toggleMapModal}
                style={{
                  background: 'transparent',
                  color: '#cccccc',
                  border: '1px solid #333333',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '13px',
                  transition: 'all 0.15s'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={toggleMapModal}
                style={{
                  background: '#FFD700',
                  color: '#000000',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '13px',
                  transition: 'all 0.15s'
                }}
              >
                Confirmar Ubicación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleMapsLocation;
