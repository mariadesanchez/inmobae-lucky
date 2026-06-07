'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { createProperty, updateProperty, uploadPropertyImage } from '@/app/actions/properties';
import dynamic from 'next/dynamic';

const MapPreview = dynamic(() => import('@/components/admin/MapPreview'), {
  ssr: false,
  loading: () => <p className="text-gray-400 font-sf-pro text-sm animate-pulse">Loading map...</p>
});

type Language = 'en' | 'es' | 'fr';

interface PropertyFormProps {
  initialData?: any;
  
}

export default function PropertyForm({ initialData }: PropertyFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeLang, setActiveLang] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    title_en: initialData?.title || '',
    title_es: initialData?.title_es || '',
    title_fr: initialData?.title_fr || '',
    description_en: '',
    description_es: '',
    description_fr: '',
    price: initialData?.price || '',
    status: initialData?.status || 'for-sale',
    category: initialData?.category || 'apartment',
    location_en: initialData?.location || '',
    location_es: initialData?.location_es || '',
    location_fr: initialData?.location_fr || '',
    latitude: initialData?.latitude || '',
    longitude: initialData?.longitude || '',
    area: initialData?.area || '',
    year: '',
    beds: initialData?.beds || 3,
    baths: initialData?.baths || 2,
    parking: 1,
    amenities: {
      pool: false,
      garden: true,
      ac: false,
      smart: false
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    
    // Handle checkboxes
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        amenities: {
          ...prev.amenities,
          [id.replace('amenity-', '')]: checked
        }
      }));
      return;
    }

    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleNumberChange = (field: 'beds' | 'baths' | 'parking', delta: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: Math.max(0, prev[field] + delta)
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingImage(true);
    
    const newImages = [...images];
    
    for (let i = 0; i < e.target.files.length; i++) {
      const file = e.target.files[i];
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const publicUrl = await uploadPropertyImage(formData);
        newImages.push(publicUrl);
      } catch (error: any) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image: ' + error.message);
      }
    }
    
    setImages(newImages);
    setUploadingImage(false);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const payload = {
        title: formData.title_en,
        title_es: formData.title_es,
        title_fr: formData.title_fr,
        price: formData.price,
        location: formData.location_en,
        location_es: formData.location_es,
        location_fr: formData.location_fr,
        latitude: formData.latitude,
        longitude: formData.longitude,
        category: formData.category,
        status: formData.status,
        beds: formData.beds,
        baths: formData.baths,
        area: formData.area,
        images: images,
      };

      if (initialData?.id) {
        await updateProperty(initialData.id, payload);
      } else {
        await createProperty(payload);
      }
      
      router.push(`/admin/properties`);
    } catch (error: any) {
      console.error('Save error:', error);
      alert(error.message);
      setIsLoading(false);
    }
  };

  const currentTitleKey = `title_${activeLang}` as keyof typeof formData;
  const currentDescKey = `description_${activeLang}` as keyof typeof formData;
  const currentLocationKey = `location_${activeLang}` as keyof typeof formData;

  return (
    <form onSubmit={handleSave} className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      {/* Header Actions for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-xl xl:hidden z-40 flex gap-3">
        <button 
          type="button" 
          onClick={() => router.back()}
          className="flex-1 py-3 rounded-lg border border-gray-300 bg-white text-argentina-navy font-medium font-sf-pro"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={isLoading || uploadingImage}
          className="flex-1 py-3 rounded-lg bg-argentina-blue text-white font-medium font-sf-pro flex justify-center items-center gap-2 disabled:opacity-70"
        >
          {isLoading ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Main Form Area */}
      <div className="xl:col-span-8 space-y-8 pb-20 xl:pb-0">
        
        {/* Language Tabs */}
        <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 p-1 w-max">
          {(['en', 'es', 'fr'] as Language[]).map(lang => (
            <button
              key={lang}
              type="button"
              onClick={() => setActiveLang(lang)}
              className={`px-6 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors ${
                activeLang === lang 
                  ? 'bg-argentina-blue text-white shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-argentina-navy'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-hint-green/30 flex items-center gap-3 bg-gradient-to-r from-hint-green/10 to-transparent">
            <div className="w-8 h-8 rounded-full bg-hint-green flex items-center justify-center text-argentina-navy">
              <span className="material-icons text-lg">info</span>
            </div>
            <h2 className="text-xl font-bold text-argentina-navy">Basic Information ({activeLang.toUpperCase()})</h2>
          </div>
          <div className="p-8 space-y-6">
            <div className="group">
              <label className="block text-sm font-medium text-argentina-navy mb-1.5 font-sf-pro" htmlFor={currentTitleKey}>
                Property Title <span className="text-red-500">*</span>
              </label>
              <input 
                id={currentTitleKey}
                type="text" 
                required
                value={formData[currentTitleKey] as string}
                onChange={handleInputChange}
                className="w-full text-base px-4 py-2.5 rounded-md border border-gray-200 bg-white text-argentina-navy placeholder-gray-400 focus:ring-1 focus:ring-argentina-blue focus:border-argentina-blue transition-all font-sf-pro outline-none" 
                placeholder="e.g. Modern Penthouse with Ocean View" 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-argentina-navy mb-1.5 font-sf-pro" htmlFor="price">
                  Price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-sf-pro text-sm">$</span>
                  <input 
                    id="price"
                    type="number" 
                    required
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full pl-7 pr-4 py-2.5 rounded-md border border-gray-200 bg-white text-argentina-navy placeholder-gray-400 focus:ring-1 focus:ring-argentina-blue focus:border-argentina-blue transition-all text-base font-medium font-sf-pro outline-none" 
                    placeholder="0.00" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-argentina-navy mb-1.5 font-sf-pro" htmlFor="status">Status</label>
                <select 
                  id="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-md border border-gray-200 bg-white text-argentina-navy focus:ring-1 focus:ring-argentina-blue focus:border-argentina-blue transition-all text-base font-sf-pro cursor-pointer outline-none"
                >
                  <option value="for-sale">For Sale</option>
                  <option value="for-rent">For Rent</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-argentina-navy mb-1.5 font-sf-pro" htmlFor="category">Property Type</label>
                <select 
                  id="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-md border border-gray-200 bg-white text-argentina-navy focus:ring-1 focus:ring-argentina-blue focus:border-argentina-blue transition-all text-base font-sf-pro cursor-pointer outline-none"
                >
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="villa">Villa</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-hint-green/30 flex items-center gap-3 bg-gradient-to-r from-hint-green/10 to-transparent">
            <div className="w-8 h-8 rounded-full bg-hint-green flex items-center justify-center text-argentina-navy">
              <span className="material-icons text-lg">description</span>
            </div>
            <h2 className="text-xl font-bold text-argentina-navy">Description ({activeLang.toUpperCase()})</h2>
          </div>
          <div className="p-8">
            <div className="mb-3 flex gap-2 border-b border-gray-100 pb-2">
              <button type="button" className="p-1.5 text-gray-400 hover:text-argentina-navy hover:bg-gray-50 rounded transition-colors"><span className="material-icons text-lg">format_bold</span></button>
              <button type="button" className="p-1.5 text-gray-400 hover:text-argentina-navy hover:bg-gray-50 rounded transition-colors"><span className="material-icons text-lg">format_italic</span></button>
              <button type="button" className="p-1.5 text-gray-400 hover:text-argentina-navy hover:bg-gray-50 rounded transition-colors"><span className="material-icons text-lg">format_list_bulleted</span></button>
            </div>
            <textarea 
              id={currentDescKey}
              value={formData[currentDescKey] as string}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-md border border-gray-200 bg-white text-argentina-navy placeholder-gray-400 focus:ring-1 focus:ring-argentina-blue focus:border-argentina-blue transition-all text-base font-sf-pro leading-relaxed resize-y min-h-[200px] outline-none" 
              placeholder="Describe the property features, neighborhood, and unique selling points..."
            />
            <div className="mt-2 text-right text-xs text-gray-400 font-sf-pro">
              <span className="text-argentina-blue font-medium text-xs">Note: Description fields must be manually added to DB schema to persist.</span>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-hint-green/30 flex justify-between items-center bg-gradient-to-r from-hint-green/10 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-hint-green flex items-center justify-center text-argentina-navy">
                <span className="material-icons text-lg">image</span>
              </div>
              <h2 className="text-xl font-bold text-argentina-navy">Gallery</h2>
            </div>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded font-sf-pro">JPG, PNG, WEBP</span>
          </div>
          <div className="p-8">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed ${uploadingImage ? 'border-argentina-blue bg-hint-green/10' : 'border-gray-300 bg-gray-50/50'} rounded-xl p-10 text-center hover:bg-hint-green/10 hover:border-argentina-blue/40 transition-colors cursor-pointer group`}
            >
              <input 
                ref={fileInputRef}
                onChange={handleImageUpload}
                type="file" 
                multiple 
                accept="image/png, image/jpeg, image/webp"
                className="hidden" 
              />
              <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
                <div className={`w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-argentina-blue ${uploadingImage ? 'animate-bounce' : 'group-hover:scale-110 transition-transform duration-300'}`}>
                  <span className="material-icons text-2xl">{uploadingImage ? 'sync' : 'cloud_upload'}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-base font-medium text-argentina-navy font-sf-pro">
                    {uploadingImage ? 'Uploading...' : 'Click or drag images here'}
                  </p>
                  <p className="text-xs text-gray-400 font-sf-pro">Max file size 5MB per image</p>
                </div>
              </div>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                {images.map((img, i) => (
                  <div key={i} className="aspect-square rounded-lg overflow-hidden relative group shadow-sm bg-gray-100">
                    <img src={img} alt={`Gallery image ${i+1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-argentina-navy/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                      <button 
                        type="button" 
                        onClick={() => removeImage(i)}
                        className="w-8 h-8 rounded-full bg-white text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors"
                      >
                        <span className="material-icons text-sm">delete</span>
                      </button>
                    </div>
                    {i === 0 && (
                      <span className="absolute top-2 left-2 bg-argentina-blue text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm font-sf-pro uppercase tracking-wider">Main</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Details */}
      <div className="xl:col-span-4 space-y-8">
        
        {/* Desktop Save Button */}
        <div className="hidden xl:flex gap-3 justify-end mb-4">
          <button 
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-argentina-navy hover:bg-gray-50 transition-colors font-medium font-sf-pro text-sm"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={isLoading || uploadingImage}
            className="px-5 py-2.5 rounded-lg bg-argentina-blue hover:bg-argentina-blue/90 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 font-sf-pro text-sm disabled:opacity-70"
          >
            <span className="material-icons text-sm">save</span>
            {isLoading ? 'Saving...' : 'Save Property'}
          </button>
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-hint-green/30 flex items-center gap-3 bg-gradient-to-r from-hint-green/10 to-transparent">
            <div className="w-8 h-8 rounded-full bg-hint-green flex items-center justify-center text-argentina-navy">
              <span className="material-icons text-lg">place</span>
            </div>
            <h2 className="text-lg font-bold text-argentina-navy">Location ({activeLang.toUpperCase()})</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-argentina-navy mb-1.5 font-sf-pro" htmlFor={currentLocationKey}>Address</label>
              <input 
                id={currentLocationKey}
                type="text" 
                value={formData[currentLocationKey] as string}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-md border border-gray-200 bg-white text-argentina-navy placeholder-gray-400 focus:ring-1 focus:ring-argentina-blue focus:border-argentina-blue transition-all text-sm font-sf-pro outline-none" 
                placeholder="Street Address, City, Zip" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-argentina-navy mb-1.5 font-sf-pro" htmlFor="latitude">Latitude</label>
                <input 
                  id="latitude"
                  type="text" 
                  value={formData.latitude}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-md border border-gray-200 bg-white text-argentina-navy placeholder-gray-400 focus:ring-1 focus:ring-argentina-blue focus:border-argentina-blue transition-all text-sm font-sf-pro outline-none" 
                  placeholder="-34.6037" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-argentina-navy mb-1.5 font-sf-pro" htmlFor="longitude">Longitude</label>
                <input 
                  id="longitude"
                  type="text" 
                  value={formData.longitude}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-md border border-gray-200 bg-white text-argentina-navy placeholder-gray-400 focus:ring-1 focus:ring-argentina-blue focus:border-argentina-blue transition-all text-sm font-sf-pro outline-none" 
                  placeholder="-58.3816" 
                />
              </div>
            </div>
            <div className="relative h-48 w-full rounded-lg overflow-hidden bg-gray-100 border border-gray-200 group flex items-center justify-center">
              <MapPreview lat={formData.latitude} lng={formData.longitude} />
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
          <div className="px-6 py-4 border-b border-hint-green/30 flex items-center gap-3 bg-gradient-to-r from-hint-green/10 to-transparent">
            <div className="w-8 h-8 rounded-full bg-hint-green flex items-center justify-center text-argentina-navy">
              <span className="material-icons text-lg">straighten</span>
            </div>
            <h2 className="text-lg font-bold text-argentina-navy">Details</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <label className="text-xs text-gray-500 font-medium font-sf-pro mb-1 block" htmlFor="area">Area (m²)</label>
                <input 
                  id="area"
                  type="number" 
                  value={formData.area}
                  onChange={handleInputChange}
                  className="w-full text-left px-3 py-2 rounded border border-gray-200 bg-gray-50 text-argentina-navy focus:bg-white focus:ring-1 focus:ring-argentina-blue focus:border-argentina-blue transition-all font-sf-pro text-sm outline-none" 
                  placeholder="0" 
                />
              </div>
              <div className="group">
                <label className="text-xs text-gray-500 font-medium font-sf-pro mb-1 block" htmlFor="year">Year Built</label>
                <input 
                  id="year"
                  type="number" 
                  value={formData.year}
                  onChange={handleInputChange}
                  className="w-full text-left px-3 py-2 rounded border border-gray-200 bg-gray-50 text-argentina-navy focus:bg-white focus:ring-1 focus:ring-argentina-blue focus:border-argentina-blue transition-all font-sf-pro text-sm outline-none" 
                  placeholder="YYYY" 
                />
              </div>
            </div>
            
            <hr className="border-gray-100" />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-argentina-navy font-sf-pro flex items-center gap-2">
                  <span className="material-icons text-gray-400 text-sm">bed</span> Bedrooms
                </label>
                <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm">
                  <button type="button" onClick={() => handleNumberChange('beds', -1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-r border-gray-100">-</button>
                  <input type="text" readOnly value={formData.beds} className="w-10 text-center border-none bg-transparent text-argentina-navy p-0 focus:ring-0 text-sm font-medium font-sf-pro outline-none" />
                  <button type="button" onClick={() => handleNumberChange('beds', 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-l border-gray-100">+</button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-argentina-navy font-sf-pro flex items-center gap-2">
                  <span className="material-icons text-gray-400 text-sm">shower</span> Bathrooms
                </label>
                <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm">
                  <button type="button" onClick={() => handleNumberChange('baths', -1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-r border-gray-100">-</button>
                  <input type="text" readOnly value={formData.baths} className="w-10 text-center border-none bg-transparent text-argentina-navy p-0 focus:ring-0 text-sm font-medium font-sf-pro outline-none" />
                  <button type="button" onClick={() => handleNumberChange('baths', 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-l border-gray-100">+</button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-argentina-navy font-sf-pro flex items-center gap-2">
                  <span className="material-icons text-gray-400 text-sm">directions_car</span> Parking
                </label>
                <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm">
                  <button type="button" onClick={() => handleNumberChange('parking', -1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-r border-gray-100">-</button>
                  <input type="text" readOnly value={formData.parking} className="w-10 text-center border-none bg-transparent text-argentina-navy p-0 focus:ring-0 text-sm font-medium font-sf-pro outline-none" />
                  <button type="button" onClick={() => handleNumberChange('parking', 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-l border-gray-100">+</button>
                </div>
              </div>
            </div>
            
            <hr className="border-gray-100" />
            
            <div>
              <h3 className="font-bold mb-3 font-sf-pro uppercase tracking-wider text-xs text-gray-500">Amenities</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2.5 cursor-pointer group w-max">
                  <input id="amenity-pool" type="checkbox" checked={formData.amenities.pool} onChange={handleInputChange} className="w-4 h-4 text-argentina-blue border-gray-300 rounded focus:ring-argentina-blue" />
                  <span className="text-sm text-gray-700 font-sf-pro group-hover:text-argentina-navy transition-colors">Swimming Pool</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer group w-max">
                  <input id="amenity-garden" type="checkbox" checked={formData.amenities.garden} onChange={handleInputChange} className="w-4 h-4 text-argentina-blue border-gray-300 rounded focus:ring-argentina-blue" />
                  <span className="text-sm text-gray-700 font-sf-pro group-hover:text-argentina-navy transition-colors">Garden</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer group w-max">
                  <input id="amenity-ac" type="checkbox" checked={formData.amenities.ac} onChange={handleInputChange} className="w-4 h-4 text-argentina-blue border-gray-300 rounded focus:ring-argentina-blue" />
                  <span className="text-sm text-gray-700 font-sf-pro group-hover:text-argentina-navy transition-colors">Air Conditioning</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer group w-max">
                  <input id="amenity-smart" type="checkbox" checked={formData.amenities.smart} onChange={handleInputChange} className="w-4 h-4 text-argentina-blue border-gray-300 rounded focus:ring-argentina-blue" />
                  <span className="text-sm text-gray-700 font-sf-pro group-hover:text-argentina-navy transition-colors">Smart Home</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
