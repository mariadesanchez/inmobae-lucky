import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { mapDbRowToProperty } from '@/lib/property-mapper';
import Navbar from '@/components/Navbar';
import PropertyGallery from '@/components/PropertyGallery';
import PropertyMapWrapper from '@/components/PropertyMapWrapper';

interface PropertyPageProps {
  params: Promise<{ slug: string }>;
}


// Fallback detail builder for description, garage, agent, and amenities
const getPropertyDetailData = (id: string, title: string, location: string, beds: number, baths: number) => {
  const defaults = {
    description: `Experience modern luxury in this architecturally stunning home located in the heart of ${location.split(',')[0]}. Designed with an emphasis on indoor-outdoor living, the residence features floor-to-ceiling glass walls that flood the interiors with natural light. The open-concept kitchen is equipped with top-of-the-line appliances and custom cabinetry, perfect for culinary enthusiasts.`,
    garage: 2,
    amenities: [
      "Smart Home System",
      "Swimming Pool",
      "Central Heating & Cooling",
      "Electric Vehicle Charging",
      "Private Gym",
      "Wine Cellar"
    ],
    agent: {
      name: "Sarah Jenkins",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD4TxUmdQRb2VMjuaNxLEwLorv_dgHzoET2_wL5toSvew6nhtziaR3DX-U69DBN7J74yO6oKokpw8tqEFutJf13MeXghCy7FwZuAxnoJel6FYcKeCRUVinpZtrNnkZvXd-MY5_2MAtRD7JP5BieHixfCaeAPW04jm-y-nvF3HIrwcZ_HRDk_MrNP5WiPV3u9zNrEgM-SQoWGh4xLVSV444aZAbVl03mjjsW5WBpIeodCyqJxprTDp6Q157D06VxcdUSCf-l9UKQT-w",
      rating: "Top Rated Agent"
    },
    mortgage: {
      monthly: "$5,430/mo",
      downPercent: "20%"
    }
  };

  const detailedData: Record<string, typeof defaults> = {
    "1": {
      description: "Designed by renowned modernist architects, The Glass Pavilion in Beverly Hills is a masterclass in clean lines and structural transparency. Floor-to-ceiling glass paneling blurs the boundary between indoor elegance and lush manicured gardens. Outfitted with premium terrazzo flooring, chef-grade kitchen spaces, and a gallery-sized showroom garage.",
      garage: 4,
      amenities: [
        "Smart Home System",
        "Infinity Swimming Pool",
        "Central Heating & Cooling",
        "Electric Vehicle Charging",
        "Private Gym",
        "Wine Cellar",
        "Guest House",
        "Home Theater"
      ],
      agent: {
        name: "Sarah Jenkins",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD4TxUmdQRb2VMjuaNxLEwLorv_dgHzoET2_wL5toSvew6nhtziaR3DX-U69DBN7J74yO6oKokpw8tqEFutJf13MeXghCy7FwZuAxnoJel6FYcKeCRUVinpZtrNnkZvXd-MY5_2MAtRD7JP5BieHixfCaeAPW04jm-y-nvF3HIrwcZ_HRDk_MrNP5WiPV3u9zNrEgM-SQoWGh4xLVSV444aZAbVl03mjjsW5WBpIeodCyqJxprTDp6Q157D06VxcdUSCf-l9UKQT-w",
        rating: "Top Rated Agent"
      },
      mortgage: {
        monthly: "$23,400/mo",
        downPercent: "20%"
      }
    },
    "2": {
      description: "Azure Heights Penthouse is the pinnacle of high-rise luxury, offering panoramic 360-degree views of Downtown Vancouver's skyline and waterfront. Fully custom interior millwork, sub-zero refrigeration, and automated motorized blinds. The private rooftop deck features an outdoor kitchen and a glass-walled heated spa pool.",
      garage: 2,
      amenities: [
        "24/7 Concierge Service",
        "Rooftop Heated Pool",
        "Automated Blinds",
        "Private Elevator Access",
        "Electric Vehicle Charging",
        "Fitness Center",
        "Secure Storage Locker"
      ],
      agent: {
        name: "Michael Chang",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCAWhQZ663Bd08kmzjbOPmUk4UIxYooNONShMEFXLR-DtmVi6Oz-TiaY77SPwFk7g0OobkeZEOMvt6v29mSOD0Xm2g95WbBG3ZjWXmiABOUwGU0LOySRfVDo-JTXQ0-gtwjWxbmue0qDm91m-zEOEZwAW6iRFB1qC1bAU-wkjxm67Sbztq8w7srHkFT9bVEC86qG-FzhOBTomhAurNRmx9l8Yfqabk328NfdKuVLckgCdaPsNFE3yN65MeoRi05GA_gXIMwG4YDIeA",
        rating: "Luxury Penthouse Specialist"
      },
      mortgage: {
        monthly: "$16,900/mo",
        downPercent: "20%"
      }
    }
  };

  return detailedData[id] || {
    ...defaults,
    garage: Math.max(1, Math.min(4, Math.floor(beds / 1.5))),
    mortgage: {
      monthly: `$${Math.round(Math.max(100, Math.min(250000, beds * baths * 1250))).toLocaleString('en-US')}/mo`,
      downPercent: "20%"
    }
  };
};

export default async function PropertyDetailPage({ params }: PropertyPageProps) {
  const { slug } = await params;
  
  // Extract property ID from the end of the slug (slugify(title)-id)
  const segments = slug.split('-');
  const id = segments[segments.length - 1];

  if (!id) {
    return notFound();
  }

  const supabase = await createClient();
  const { data: rawRow, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !rawRow) {
    return notFound();
  }

  const property = mapDbRowToProperty(rawRow);
  const details = getPropertyDetailData(property.id, property.title, property.location, property.beds, property.baths);

  // SEO Schema.org JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SingleFamilyResidence',
    'name': property.title,
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': property.location,
    },
    'image': property.images[0] || property.image,
    'numberOfBedrooms': property.beds,
    'numberOfBathrooms': property.baths,
    'offers': {
      '@type': 'Offer',
      'price': property.price,
      'priceCurrency': 'USD',
    }
  };

  return (
    <>
      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          
          {/* Left Column: Image gallery */}
          <div className="lg:col-span-8 space-y-4">
            <PropertyGallery 
              images={property.images} 
              title={property.title} 
              isNew={property.is_new}
              category={rawRow.category}
            />
          </div>

          {/* Right Column: Pricing, Agent and Map */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-28 space-y-6">
              
              {/* Pricing & Booking Card */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-mosque/5">
                <div className="mb-4">
                  <h1 className="text-4xl font-display font-light text-nordic mb-2">
                    ${property.price.toLocaleString('en-US')}
                    {property.type === 'rent' && (
                      <span className="text-lg font-normal text-nordic-muted">/mo</span>
                    )}
                  </h1>
                  <p className="text-nordic/60 font-medium flex items-center gap-1">
                    <span className="material-icons text-mosque text-sm">location_on</span>
                    {property.location}
                  </p>
                </div>
                
                <div className="h-px bg-slate-100 my-6"></div>
                
                {/* Agent Profile info */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-sm relative">
                    <Image
                      src={details.agent.image}
                      alt={details.agent.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-nordic">{details.agent.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-mosque font-medium">
                      <span className="material-icons text-[14px]">star</span>
                      <span>{details.agent.rating}</span>
                    </div>
                  </div>
                  <div className="ml-auto flex gap-2">
                    <a
                      href={`https://wa.me/5491122334455?text=Hola%2C%20estoy%20interesado%20en%20la%20propiedad%20${encodeURIComponent(property.title)}%20(ID%3A%20${property.id})`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-mosque/10 text-mosque hover:bg-mosque hover:text-white transition-colors"
                      title="WhatsApp Chat"
                    >
                      <span className="material-icons text-sm">chat</span>
                    </a>
                    <a
                      href="tel:+5491122334455"
                      className="p-2 rounded-full bg-mosque/10 text-mosque hover:bg-mosque hover:text-white transition-colors"
                      title="Call Agent"
                    >
                      <span className="material-icons text-sm">call</span>
                    </a>
                  </div>
                </div>

                <div className="space-y-3">
                  <button className="w-full bg-mosque hover:bg-primary-hover text-white py-4 px-6 rounded-lg font-medium transition-all shadow-lg shadow-mosque/20 flex items-center justify-center gap-2 group">
                    <span className="material-icons text-xl group-hover:scale-110 transition-transform">calendar_today</span>
                    Schedule Visit
                  </button>
                  <button className="w-full bg-transparent border border-nordic/10 hover:border-mosque text-nordic/80 hover:text-mosque py-4 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2">
                    <span className="material-icons text-xl">mail_outline</span>
                    Contact Agent
                  </button>
                </div>
              </div>

              {/* Map Card with dynamic Leaflet map component */}
              <div className="bg-white p-2 rounded-xl shadow-sm border border-mosque/5">
                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-slate-100">
                  <PropertyMapWrapper location={property.location} title={property.title} />
                </div>
              </div>

            </div>
          </div>

          {/* Left Bottom Column: Details, description, amenities */}
          <div className="lg:col-span-8 lg:row-start-2 -mt-8 space-y-8">
            
            {/* Features block */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-mosque/5">
              <h2 className="text-lg font-semibold mb-6 text-nordic">Property Features</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex flex-col items-center justify-center p-4 bg-mosque/5 rounded-lg border border-mosque/10">
                  <span className="material-icons text-mosque text-2xl mb-2">square_foot</span>
                  <span className="text-xl font-bold text-nordic">{property.sqft}</span>
                  <span className="text-xs uppercase tracking-wider text-nordic/50">Square Meters</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-mosque/5 rounded-lg border border-mosque/10">
                  <span className="material-icons text-mosque text-2xl mb-2">bed</span>
                  <span className="text-xl font-bold text-nordic">{property.beds}</span>
                  <span className="text-xs uppercase tracking-wider text-nordic/50">Bedrooms</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-mosque/5 rounded-lg border border-mosque/10">
                  <span className="material-icons text-mosque text-2xl mb-2">shower</span>
                  <span className="text-xl font-bold text-nordic">{property.baths}</span>
                  <span className="text-xs uppercase tracking-wider text-nordic/50">Bathrooms</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-mosque/5 rounded-lg border border-mosque/10">
                  <span className="material-icons text-mosque text-2xl mb-2">directions_car</span>
                  <span className="text-xl font-bold text-nordic">{details.garage}</span>
                  <span className="text-xs uppercase tracking-wider text-nordic/50">Garage</span>
                </div>
              </div>
            </div>

            {/* Description block */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-mosque/5">
              <h2 className="text-lg font-semibold mb-4 text-nordic">About this home</h2>
              <div className="prose prose-slate max-w-none text-nordic/70 leading-relaxed">
                <p>{details.description}</p>
              </div>
            </div>

            {/* Amenities block */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-mosque/5">
              <h2 className="text-lg font-semibold mb-6 text-nordic">Amenities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                {details.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-3 text-nordic/70">
                    <span className="material-icons text-mosque/60 text-sm">check_circle</span>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mortgage Calculator promotion block */}
            <div className="bg-mosque/5 p-6 rounded-xl border border-mosque/10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-full text-mosque shadow-sm">
                  <span className="material-icons">calculate</span>
                </div>
                <div>
                  <h3 className="font-semibold text-nordic">Estimated Payment</h3>
                  <p className="text-sm text-nordic/60">
                    Starting from <strong className="text-mosque">{details.mortgage.monthly}</strong> with {details.mortgage.downPercent} down
                  </p>
                </div>
              </div>
              <button className="whitespace-nowrap px-4 py-2 bg-white border border-nordic/10 rounded-lg text-sm font-semibold hover:border-mosque transition-colors text-nordic">
                Calculate Mortgage
              </button>
            </div>

          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 mt-12 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-sm text-nordic/50">
            © 2026 LuxeEstate Inc. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a className="text-nordic/40 hover:text-mosque transition-colors" href="#">
              <span className="sr-only">Facebook</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path>
              </svg>
            </a>
            <a className="text-nordic/40 hover:text-mosque transition-colors" href="#">
              <span className="sr-only">Twitter</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
