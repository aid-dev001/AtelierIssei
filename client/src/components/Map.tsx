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
      <div ref={mapRef} className="absolute inset-0">
        <svg width="100%" height="100%" viewBox="0 0 1200 600" xmlns="http://www.w3.org/2000/svg">
          <rect width="1200" height="600" fill="#f8f9fa"/>
          <g fill="#e9ecef" stroke="#dee2e6" strokeWidth="1">
            {/* 北アメリカ */}
            <path d="M150,150 C250,100 350,120 450,150 C500,180 520,250 500,300 C480,350 430,380 380,400 C330,420 280,410 230,390 C180,370 150,330 130,280 C110,230 100,200 150,150 Z"/>
            {/* 南アメリカ */}
            <path d="M300,400 C350,380 400,390 430,440 C460,490 470,540 450,580 C430,620 380,630 330,610 C280,590 260,540 270,490 C280,440 300,420 300,400 Z"/>
            {/* ヨーロッパ */}
            <path d="M550,150 C600,130 650,120 700,130 C750,140 780,170 790,220 C800,270 790,320 760,360 C730,400 680,420 630,410 C580,400 550,370 530,320 C510,270 510,220 550,150 Z"/>
            {/* アフリカ */}
            <path d="M550,300 C600,280 650,290 690,320 C730,350 750,400 740,450 C730,500 700,540 650,560 C600,580 550,570 510,540 C470,510 450,460 460,410 C470,360 500,320 550,300 Z"/>
            {/* アジア */}
            <path d="M700,150 C750,130 800,120 850,130 C900,140 950,170 980,220 C1010,270 1020,330 1000,380 C980,430 940,470 890,490 C840,510 790,500 750,470 C710,440 690,390 680,340 C670,290 670,240 700,150 Z"/>
            {/* オーストラリア */}
            <path d="M900,450 C950,430 1000,440 1030,480 C1060,520 1070,570 1050,610 C1030,650 980,670 930,650 C880,630 850,590 850,540 C850,490 870,450 900,450 Z"/>
          </g>
        </svg>
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/5" />
    </div>
  );
};

export default WorldMap;
