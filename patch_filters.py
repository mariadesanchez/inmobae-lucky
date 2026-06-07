import re

with open('components/FiltersModal.tsx', 'r') as f:
    content = f.read()

new_section_3_and_4 = """
          {/* Section 3: Destacadas vs Comunes & Published Date */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Mostrar Propiedades
              </label>
              <div className="relative">
                <select
                  value={filters.featuredStatus}
                  onChange={(e) => setFilters((p) => ({ ...p, featuredStatus: e.target.value }))}
                  className="w-full bg-gray-50 border-0 rounded-lg py-3 pl-4 pr-10 text-gray-900 appearance-none focus:ring-2 focus:ring-argentina-blue cursor-pointer outline-none"
                >
                  <option value="Todas">Todas</option>
                  <option value="Destacadas">Solo Destacadas</option>
                  <option value="Comunes">Solo Comunes</option>
                </select>
                <span className="material-icons font-material-icons absolute right-3 top-3 text-gray-400 pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Fecha de Publicación
              </label>
              <div className="relative">
                <select
                  value={filters.datePublished}
                  onChange={(e) => setFilters((p) => ({ ...p, datePublished: e.target.value }))}
                  className="w-full bg-gray-50 border-0 rounded-lg py-3 pl-4 pr-10 text-gray-900 appearance-none focus:ring-2 focus:ring-argentina-blue cursor-pointer outline-none"
                >
                  <option value="Cualquiera">Cualquiera</option>
                  <option value="Hoy">Hoy</option>
                  <option value="Última semana">Última semana</option>
                  <option value="Últimos 15 días">Últimos 15 días</option>
                  <option value="Últimos 30 días">Últimos 30 días</option>
                  <option value="Últimos 45 días">Últimos 45 días</option>
                </select>
                <span className="material-icons font-material-icons absolute right-3 top-3 text-gray-400 pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>
          </section>

          {/* Section 4: Property Details */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {dict?.propertyType || 'Property Type'}
              </label>
              <div className="relative">
                <select
                  value={filters.propertyType}
                  onChange={(e) => setFilters((p) => ({ ...p, propertyType: e.target.value }))}
                  className="w-full bg-gray-50 border-0 rounded-lg py-3 pl-4 pr-10 text-gray-900 appearance-none focus:ring-2 focus:ring-argentina-blue cursor-pointer outline-none"
                >
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                <span className="material-icons font-material-icons absolute right-3 top-3 text-gray-400 pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg border border-transparent focus-within:border-argentina-blue/30 transition-colors">
                <label className="block text-[10px] text-gray-500 uppercase font-medium mb-1">M2 Desde</label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={filters.minArea}
                    onChange={(e) => {
                      const cleaned = Number(e.target.value.replace(/\D/g, ''));
                      if (!isNaN(cleaned)) {
                        setFilters((p) => ({ ...p, minArea: cleaned }));
                      }
                    }}
                    className="w-full bg-transparent border-0 p-0 text-gray-900 font-medium focus:ring-0 text-sm outline-none"
                  />
                  <span className="text-gray-400 ml-1 text-xs">m²</span>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-transparent focus-within:border-argentina-blue/30 transition-colors">
                <label className="block text-[10px] text-gray-500 uppercase font-medium mb-1">M2 Hasta</label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={filters.maxArea === 10000 ? '' : filters.maxArea}
                    placeholder="Sin límite"
                    onChange={(e) => {
                      if (e.target.value === '') {
                        setFilters((p) => ({ ...p, maxArea: 10000 }));
                        return;
                      }
                      const cleaned = Number(e.target.value.replace(/\D/g, ''));
                      if (!isNaN(cleaned)) {
                        setFilters((p) => ({ ...p, maxArea: cleaned }));
                      }
                    }}
                    className="w-full bg-transparent border-0 p-0 text-gray-900 font-medium focus:ring-0 text-sm outline-none placeholder-gray-400"
                  />
                  <span className="text-gray-400 ml-1 text-xs">m²</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">Antigüedad</span>
                <select
                  value={filters.age}
                  onChange={(e) => setFilters((p) => ({ ...p, age: e.target.value }))}
                  className="w-40 bg-gray-50 border-0 rounded-lg py-2 pl-3 pr-8 text-gray-900 text-sm appearance-none focus:ring-2 focus:ring-argentina-blue cursor-pointer outline-none"
                >
                  <option value="Cualquiera">Cualquiera</option>
                  <option value="En construcción">En construcción</option>
                  <option value="A estrenar">A estrenar</option>
                  <option value="Hasta 5 años">Hasta 5 años</option>
                  <option value="Hasta 10 años">Hasta 10 años</option>
                  <option value="Hasta 20 años">Hasta 20 años</option>
                  <option value="Más de 30 años">Más de 30 años</option>
                </select>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">Disposición</span>
                <select
                  value={filters.disposition}
                  onChange={(e) => setFilters((p) => ({ ...p, disposition: e.target.value }))}
                  className="w-40 bg-gray-50 border-0 rounded-lg py-2 pl-3 pr-8 text-gray-900 text-sm appearance-none focus:ring-2 focus:ring-argentina-blue cursor-pointer outline-none"
                >
                  <option value="Cualquiera">Cualquiera</option>
                  <option value="Frente">Frente</option>
                  <option value="Contrafrente">Contrafrente</option>
                  <option value="Lateral">Lateral</option>
                  <option value="Interior">Interior</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">{dict?.bedrooms || 'Bedrooms'}</span>
                <div className="flex items-center space-x-3 bg-gray-50 rounded-full p-1">
                  <button onClick={() => setFilters((p) => ({ ...p, beds: Math.max(0, p.beds - 1) }))} className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-argentina-blue disabled:opacity-40 transition-colors" disabled={filters.beds === 0}><span className="material-icons font-material-icons text-base">remove</span></button>
                  <span className="text-sm font-semibold w-6 text-center">{filters.beds === 0 ? 'Cualquiera' : `${filters.beds}+`}</span>
                  <button onClick={() => setFilters((p) => ({ ...p, beds: p.beds + 1 }))} className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-argentina-blue hover:bg-argentina-blue hover:text-white transition-colors"><span className="material-icons font-material-icons text-base">add</span></button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">{dict?.bathrooms || 'Bathrooms'}</span>
                <div className="flex items-center space-x-3 bg-gray-50 rounded-full p-1">
                  <button onClick={() => setFilters((p) => ({ ...p, baths: Math.max(0, p.baths - 1) }))} className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-argentina-blue disabled:opacity-40 transition-colors" disabled={filters.baths === 0}><span className="material-icons font-material-icons text-base">remove</span></button>
                  <span className="text-sm font-semibold w-6 text-center">{filters.baths === 0 ? 'Cualquiera' : `${filters.baths}+`}</span>
                  <button onClick={() => setFilters((p) => ({ ...p, baths: p.baths + 1 }))} className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-argentina-blue hover:bg-argentina-blue hover:text-white transition-colors"><span className="material-icons font-material-icons text-base">add</span></button>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">Cocheras</span>
                <div className="flex items-center space-x-3 bg-gray-50 rounded-full p-1">
                  <button onClick={() => setFilters((p) => ({ ...p, parking: Math.max(0, p.parking - 1) }))} className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-argentina-blue disabled:opacity-40 transition-colors" disabled={filters.parking === 0}><span className="material-icons font-material-icons text-base">remove</span></button>
                  <span className="text-sm font-semibold w-6 text-center">{filters.parking === 0 ? 'Cualquiera' : `${filters.parking}+`}</span>
                  <button onClick={() => setFilters((p) => ({ ...p, parking: p.parking + 1 }))} className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-argentina-blue hover:bg-argentina-blue hover:text-white transition-colors"><span className="material-icons font-material-icons text-base">add</span></button>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Amenities */}
          <section>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Características de la propiedad
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {PROPERTY_FEATURES.property.map((amenity) => {
                const active = filters.amenities.includes(amenity);
                return (
                  <label key={amenity} className="cursor-pointer group relative">
                    <input type="checkbox" checked={active} onChange={() => toggleAmenity(amenity)} className="sr-only peer" />
                    <div className={`h-full px-4 py-3 rounded-lg border text-sm flex items-center justify-center gap-2 transition-all ${active ? 'border-argentina-blue bg-argentina-blue/5 text-argentina-blue font-medium' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
                      {amenity}
                    </div>
                    {active && <div className="absolute top-2 right-2 w-2 h-2 bg-argentina-blue rounded-full" />}
                  </label>
                );
              })}
            </div>

            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Tipos de ambientes
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {PROPERTY_FEATURES.rooms.map((amenity) => {
                const active = filters.amenities.includes(amenity);
                return (
                  <label key={amenity} className="cursor-pointer group relative">
                    <input type="checkbox" checked={active} onChange={() => toggleAmenity(amenity)} className="sr-only peer" />
                    <div className={`h-full px-4 py-3 rounded-lg border text-sm flex items-center justify-center gap-2 transition-all ${active ? 'border-argentina-blue bg-argentina-blue/5 text-argentina-blue font-medium' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
                      {amenity}
                    </div>
                    {active && <div className="absolute top-2 right-2 w-2 h-2 bg-argentina-blue rounded-full" />}
                  </label>
                );
              })}
            </div>

            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Servicios
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {PROPERTY_FEATURES.services.map((amenity) => {
                const active = filters.amenities.includes(amenity);
                return (
                  <label key={amenity} className="cursor-pointer group relative">
                    <input type="checkbox" checked={active} onChange={() => toggleAmenity(amenity)} className="sr-only peer" />
                    <div className={`h-full px-4 py-3 rounded-lg border text-sm flex items-center justify-center gap-2 transition-all ${active ? 'border-argentina-blue bg-argentina-blue/5 text-argentina-blue font-medium' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
                      {amenity}
                    </div>
                    {active && <div className="absolute top-2 right-2 w-2 h-2 bg-argentina-blue rounded-full" />}
                  </label>
                );
              })}
            </div>

            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Comodidades
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PROPERTY_FEATURES.amenities.map((amenity) => {
                const active = filters.amenities.includes(amenity);
                return (
                  <label key={amenity} className="cursor-pointer group relative">
                    <input type="checkbox" checked={active} onChange={() => toggleAmenity(amenity)} className="sr-only peer" />
                    <div className={`h-full px-4 py-3 rounded-lg border text-sm flex items-center justify-center gap-2 transition-all ${active ? 'border-argentina-blue bg-argentina-blue/5 text-argentina-blue font-medium' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
                      {amenity}
                    </div>
                    {active && <div className="absolute top-2 right-2 w-2 h-2 bg-argentina-blue rounded-full" />}
                  </label>
                );
              })}
            </div>
          </section>
"""

new_content = re.sub(
    r'\{\/\* Section 3: Property Details \*\/\}.*?\{\/\* Footer \*\/\}',
    new_section_3_and_4.replace('\\', '\\\\') + '\n        {/* Footer */}',
    content,
    flags=re.DOTALL
)

with open('components/FiltersModal.tsx', 'w') as f:
    f.write(new_content)

print("Patch applied")
