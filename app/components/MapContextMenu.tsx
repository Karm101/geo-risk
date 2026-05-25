"use client"

import { useMapEvents, Popup } from 'react-leaflet';
import { useState } from 'react';
import * as turf from '@turf/turf';
import { MapPin, Copy } from 'lucide-react'; 

const MapContextMenu = ({ barangayGeoJSON, onOpenStationDialog }) => {
  const [menuPosition, setMenuPosition] = useState(null);

  useMapEvents({
    contextmenu(e) {
      setMenuPosition(e.latlng);
    },
    click() {
      if (menuPosition) setMenuPosition(null);
    }
  });

  const handleCopyCoordinates = () => {
    const coords = `${menuPosition.lat.toFixed(5)}, ${menuPosition.lng.toFixed(5)}`;
    navigator.clipboard.writeText(coords);
    alert('Coordinates copied to clipboard.');
    setMenuPosition(null);
  };

  const handleAddStation = () => {
    const clickedPoint = turf.point([menuPosition.lng, menuPosition.lat]);
    let selectedBarangay = "";

    if (barangayGeoJSON) {
      turf.featureEach(barangayGeoJSON, (currentFeature) => {
        // 1. We verify the geometry at runtime (This is the actual safety net)
        const geomType = currentFeature.geometry?.type;
        
        if (geomType === 'Polygon' || geomType === 'MultiPolygon') {
          // 2. Since we know it's a polygon, we can safely bypass the Turf type 
          // export issue by casting currentFeature as 'any' for this single check.
          if (turf.booleanPointInPolygon(clickedPoint, currentFeature as any)) {
            selectedBarangay = currentFeature.properties?.adm4_en || ""; 
          }
        }
      });
    }

    onOpenStationDialog({
      latitude: menuPosition.lat.toFixed(5),
      longitude: menuPosition.lng.toFixed(5),
      barangay: selectedBarangay
    });
    
    setMenuPosition(null);
  };

  if (!menuPosition) return null;

  return (
    <Popup 
      position={menuPosition} 
      closeButton={false} // Hides the default 'x' for a cleaner UI
    >
      <div style={{ 
        display: 'flex', flexDirection: 'column', gap: '4px', padding: '6px',
        background: '#111520', // Solid dark background to prevent transparency
        border: '1px solid #1e2535',
        borderRadius: '8px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.9)', // Heavy shadow to pull it off the map
        minWidth: '170px'
      }}>
        <button 
          onClick={handleAddStation}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '10px',
            textAlign: 'left', padding: '8px 12px', cursor: 'pointer', 
            background: 'transparent', border: 'none',
            color: '#e2e8f0', fontFamily: "'Space Mono', monospace", fontSize: '11px',
            borderRadius: '4px'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#1e2535'}
          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <MapPin className="w-4 h-4" style={{ color: '#f43f5e' }} />
          Add New Station
        </button>

        <button 
          onClick={handleCopyCoordinates}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '10px',
            textAlign: 'left', padding: '8px 12px', cursor: 'pointer', 
            background: 'transparent', border: 'none',
            color: '#e2e8f0', fontFamily: "'Space Mono', monospace", fontSize: '11px',
            borderRadius: '4px'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#1e2535'}
          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <Copy className="w-4 h-4" style={{ color: '#94a3b8' }} />
          Copy Coordinates
        </button>
      </div>
    </Popup>
  );
};

export default MapContextMenu;