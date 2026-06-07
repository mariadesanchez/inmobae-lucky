'use client';

import dynamic from 'next/dynamic';

const PropertyMap = dynamic(() => import('@/components/PropertyMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full aspect-[4/3] rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center text-argentina-navy/40">
      Loading map...
    </div>
  )
});

interface PropertyMapWrapperProps {
  location: string;
  title: string;
}

export default function PropertyMapWrapper({ location, title }: PropertyMapWrapperProps) {
  return <PropertyMap location={location} title={title} />;
}
