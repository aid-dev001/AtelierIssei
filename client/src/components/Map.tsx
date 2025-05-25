import { useState } from "react";

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
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);

  return (
    <div className="relative w-full h-[600px] bg-gray-100 rounded-lg overflow-hidden">
      <div className="relative w-full h-full">
        {/* 世界地図の簡易背景 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full bg-blue-50">
            <div className="absolute w-[20%] h-[30%] bg-green-100 rounded-lg left-[10%] top-[25%]">
              {/* 北米 */}
            </div>
            <div className="absolute w-[10%] h-[25%] bg-green-100 rounded-lg left-[22%] top-[55%]">
              {/* 南米 */}
            </div>
            <div className="absolute w-[10%] h-[15%] bg-green-100 rounded-lg left-[42%] top-[20%]">
              {/* ヨーロッパ */}
            </div>
            <div className="absolute w-[15%] h-[25%] bg-green-100 rounded-lg left-[45%] top-[40%]">
              {/* アフリカ */}
            </div>
            <div className="absolute w-[20%] h-[25%] bg-green-100 rounded-lg left-[60%] top-[25%]">
              {/* アジア */}
            </div>
            <div className="absolute w-[10%] h-[15%] bg-green-100 rounded-lg left-[70%] top-[60%]">
              {/* オーストラリア */}
            </div>
          </div>
        </div>

        {/* マーカー */}
        {markers.map((marker) => (
          <div
            key={marker.id}
            className="absolute cursor-pointer group"
            style={{
              left: `${marker.x}%`,
              top: `${marker.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
            onClick={() => onMarkerClick && onMarkerClick(marker)}
            onMouseEnter={() => setHoveredMarker(marker.id)}
            onMouseLeave={() => setHoveredMarker(null)}
          >
            <div 
              className={`w-4 h-4 rounded-full ${selectedMarker === marker.id ? 'bg-red-500' : 'bg-blue-500'} transition-all duration-300 group-hover:scale-125 shadow-md`}
            ></div>
            
            {(hoveredMarker === marker.id || selectedMarker === marker.id) && (
              <div className="absolute z-10 bg-white p-2 rounded shadow-lg -translate-y-full -translate-x-1/2 whitespace-nowrap bottom-6">
                {marker.label}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorldMap;
