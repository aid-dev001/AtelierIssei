import { useEffect, useRef } from "react";

const CustomMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const markers = [
      { x: 50, y: 50, label: "ATELIER ISSEI MAIN GALLERY" },
      { x: 70, y: 30, label: "EXHIBITION SPACE" },
    ];

    const createMarker = (x: number, y: number, label: string) => {
      const marker = document.createElement("div");
      marker.className = "custom-map-marker absolute";
      marker.style.left = `${x}%`;
      marker.style.top = `${y}%`;
      
      const tooltip = document.createElement("div");
      tooltip.className = "absolute hidden group-hover:block bg-white p-2 rounded shadow-lg -translate-y-full -translate-x-1/2 text-sm";
      tooltip.textContent = label;
      
      marker.appendChild(tooltip);
      return marker;
    };

    markers.forEach(({ x, y, label }) => {
      mapRef.current?.appendChild(createMarker(x, y, label));
    });
  }, []);

  return (
    <div className="relative w-full h-[500px] bg-gray-100 rounded-lg overflow-hidden">
      <div ref={mapRef} className="absolute inset-0 bg-[url('https://pixabay.com/get/g62b2ff1aa56521e643b338e3851f9d23480ceb7f32aaa3aa854b7aa30a763af628bb042b3cbfc03d1bd82ea44fb9df8639ffc3ef2d4123e16e688d6c5c666b8f_1280.jpg')] bg-cover bg-center opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/10" />
    </div>
  );
};

export default CustomMap;
