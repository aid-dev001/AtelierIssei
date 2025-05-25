import { useState } from "react";
import WorldMap, { LocationMarker } from "@/components/Map";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

// Define all the locations with their coordinates on the map
const LOCATIONS: LocationMarker[] = [
  // Japan
  { 
    id: "tokyo-akasaka", 
    country: "Japan",
    x: 82, 
    y: 30, 
    label: "東京・赤坂" 
  },
  { 
    id: "tokyo-ikebukuro", 
    country: "Japan",
    x: 82.2, 
    y: 29.5, 
    label: "東京・池袋" 
  },
  { 
    id: "tokyo-okubo", 
    country: "Japan",
    x: 82.1, 
    y: 29.8, 
    label: "東京・大久保" 
  },
  { 
    id: "hiroshima", 
    country: "Japan",
    x: 81, 
    y: 31, 
    label: "広島" 
  },
  { 
    id: "fukuyama", 
    country: "Japan",
    x: 81.3, 
    y: 30.8, 
    label: "福山" 
  },
  
  // UAE
  { 
    id: "abu-dhabi", 
    country: "UAE",
    x: 60, 
    y: 37, 
    label: "アブダビ" 
  },
  
  // UK
  { 
    id: "london", 
    country: "UK",
    x: 47, 
    y: 25, 
    label: "ロンドン" 
  },
  
  // France
  { 
    id: "paris", 
    country: "France",
    x: 48, 
    y: 27, 
    label: "パリ" 
  },
  { 
    id: "nice", 
    country: "France",
    x: 49, 
    y: 29, 
    label: "ニース" 
  },
  { 
    id: "atis-mons", 
    country: "France",
    x: 48.2, 
    y: 27.2, 
    label: "アティスモンス" 
  },
  { 
    id: "normandy", 
    country: "France",
    x: 47.5, 
    y: 26.5, 
    label: "ノルマンディー" 
  },
  { 
    id: "saint-hilaire-andre", 
    country: "France",
    x: 48.5, 
    y: 27.5, 
    label: "サンティレースアンドレシス" 
  },
  { 
    id: "bourges", 
    country: "France",
    x: 48.3, 
    y: 28, 
    label: "ブールジュ" 
  },
  { 
    id: "chaumont", 
    country: "France",
    x: 48.8, 
    y: 27.8, 
    label: "ショーモン城" 
  },
  { 
    id: "chambord", 
    country: "France",
    x: 48.6, 
    y: 27.6, 
    label: "シャンボール城" 
  },
];

// Define image data for each location
const LOCATION_IMAGES: Record<string, string[]> = {
  "tokyo-akasaka": ["/artworks/12653.jpg", "/artworks/12654.jpg", "/artworks/12655.jpg"],
  "tokyo-ikebukuro": ["/artworks/12648.jpg", "/artworks/12649.jpg", "/artworks/12650.jpg"],
  "tokyo-okubo": ["/artworks/12658.jpg", "/artworks/12659.jpg", "/artworks/12660.jpg"],
  "hiroshima": ["/12672.jpg", "/12673.jpg", "/12674.jpg"],
  "fukuyama": ["/12675.jpg", "/12676.jpg", "/12677.jpg"],
  "abu-dhabi": ["/12678.jpg", "/12679.jpg", "/12680.jpg"],
  "london": ["/10819.jpg", "/10820.jpg", "/10821.jpg"],
  "paris": ["/10822.jpg", "/10823.jpg", "/12662.jpg"],
  "nice": ["/12663.jpg", "/12664.jpg", "/12665.jpg"],
  "atis-mons": ["/12666.jpg", "/12667.jpg", "/12668.jpg"],
  "normandy": ["/12669.jpg", "/12670.jpg", "/12671.jpg"],
  "saint-hilaire-andre": ["/7853.jpg", "/7855.jpg", "/8594.jpg"],
  "bourges": ["/3446.jpg", "/3525.jpg", "/3730.jpg"],
  "chaumont": ["/2266.jpg", "/2914.jpg", "/3316.jpg"],
  "chambord": ["/IMG_7161.jpg", "/IMG_7162.jpg", "/IMG_7163.jpg"],
};

// Group locations by country
const COUNTRIES = Array.from(new Set(LOCATIONS.map(loc => loc.country)));

const WorldLocations = () => {
  const [selectedLocation, setSelectedLocation] = useState<LocationMarker | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  
  const filteredLocations = selectedCountry === "all" 
    ? LOCATIONS 
    : LOCATIONS.filter(loc => loc.country === selectedCountry);

  const handleMarkerClick = (marker: LocationMarker) => {
    setSelectedLocation(marker);
  };

  return (
    <div className="space-y-12 pb-20">
      <section className="bg-gray-50">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-12 tracking-wider text-gray-800">WORLD LOCATIONS</h1>
            <p className="text-xl text-gray-700 leading-relaxed font-medium max-w-2xl mx-auto">
              世界各地で取り組んだプロジェクトとインスピレーションを得た場所。
              それぞれの地で感じた空気感や文化的影響が作品に反映されています。
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4">
        {/* Country filter tabs */}
        <Tabs defaultValue="all" value={selectedCountry} onValueChange={setSelectedCountry} className="mb-8">
          <TabsList className="flex flex-wrap justify-center">
            <TabsTrigger value="all">すべて</TabsTrigger>
            {COUNTRIES.map(country => (
              <TabsTrigger key={country} value={country}>{country}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        {/* World Map */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-12">
          <WorldMap 
            markers={filteredLocations} 
            onMarkerClick={handleMarkerClick}
            selectedMarker={selectedLocation?.id}
          />
        </div>

        {/* Selected location information */}
        {selectedLocation && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-1/3">
                <h2 className="text-3xl font-bold tracking-wide mb-4">{selectedLocation.label}</h2>
                <p className="text-xl text-gray-600 mb-6">{selectedLocation.country}</p>
                
                <div className="prose max-w-none">
                  <p>
                    {selectedLocation.label}でのアーティスト活動や訪問を通じて得られた
                    インスピレーションや文化的な影響が作品に反映されています。
                    この地域特有の雰囲気や景観、人々との交流が
                    創作プロセスに大きな影響を与えています。
                  </p>
                </div>
              </div>
              
              <div className="lg:w-2/3">
                <h3 className="text-2xl font-bold mb-6">
                  {selectedLocation.label}でのアーティスト活動
                </h3>
                
                {LOCATION_IMAGES[selectedLocation.id] ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {LOCATION_IMAGES[selectedLocation.id].map((image, i) => (
                      <div 
                        key={i} 
                        className="aspect-square bg-gray-100 rounded-lg overflow-hidden shadow-md group"
                      >
                        <img 
                          src={image} 
                          alt={`${selectedLocation.label} - ${i+1}`}
                          className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
                    No images available for this location
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {!selectedLocation && (
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <p className="text-xl text-gray-600">
              マップ上のロケーションをクリックすると、詳細情報と画像が表示されます。
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorldLocations;