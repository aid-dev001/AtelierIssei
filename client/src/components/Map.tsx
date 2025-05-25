import { useEffect, useRef, useState } from "react";

export type LocationMarker = {
  id: string;
  x: number;
  y: number;
  label: string;
  country: string;
  imageUrl?: string;
};

type WorldMapProps = {
  markers: LocationMarker[];
  onMarkerClick?: (marker: LocationMarker) => void;
  selectedMarker?: string | null;
};

const WorldMap = ({ markers, onMarkerClick, selectedMarker }: WorldMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    const existingMarkers = mapRef.current.querySelectorAll('.custom-map-marker');
    existingMarkers.forEach(marker => marker.remove());

    // Create and add new markers
    markers.forEach((marker) => {
      const markerElement = document.createElement("div");
      markerElement.className = `custom-map-marker group absolute cursor-pointer ${selectedMarker === marker.id ? 'ring-4 ring-primary ring-offset-2 z-10' : ''}`;
      markerElement.style.left = `${marker.x}%`;
      markerElement.style.top = `${marker.y}%`;
      
      // Create visual marker
      const dot = document.createElement("div");
      dot.className = `w-4 h-4 rounded-full bg-primary ${selectedMarker === marker.id ? 'scale-125' : ''} transition-all duration-300 group-hover:scale-125`;
      markerElement.appendChild(dot);
      
      // Create tooltip
      const tooltip = document.createElement("div");
      tooltip.className = "absolute hidden group-hover:block bg-white p-2 rounded shadow-lg -translate-y-full -translate-x-1/2 text-sm z-20 whitespace-nowrap";
      tooltip.textContent = marker.label;
      markerElement.appendChild(tooltip);
      
      // Add click handler
      if (onMarkerClick) {
        markerElement.addEventListener('click', () => onMarkerClick(marker));
      }
      
      mapRef.current?.appendChild(markerElement);
    });
  }, [markers, selectedMarker, onMarkerClick]);

  return (
    <div className="relative w-full h-[600px] bg-gray-100 rounded-lg overflow-hidden">
      <div 
        ref={mapRef} 
        className="absolute inset-0 bg-[url('/world-map.jpg')] bg-cover bg-center"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/5" />
    </div>
  );
};

export default WorldMap;
