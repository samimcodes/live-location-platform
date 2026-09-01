'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, MapPin, Loader2, X, Navigation2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface GeocodingResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
}

interface MapSearchBarProps {
  onSelectLocation: (lat: number, lon: number, name: string) => void;
  className?: string;
}

export function MapSearchBar({ onSelectLocation, className }: MapSearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleQueryChange = useCallback((val: string) => {
    setQuery(val);
    const q = val.trim();

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (q.length < 3) {
      setResults([]);
      setIsLoading(false);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=1`,
          { headers: { 'Accept-Language': 'en' } }
        );
        if (!res.ok) throw new Error('Search failed');
        const data: GeocodingResult[] = await res.json();
        setResults(data);
        setIsOpen(data.length > 0);
      } catch (err) {
        console.warn('Geocoding search failed:', err);
      } finally {
        setIsLoading(false);
      }
    }, 400);
  }, []);

  const handleSelect = (item: GeocodingResult) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    const shortName = item.display_name.split(',')[0];
    onSelectLocation(lat, lon, shortName);
    setQuery(shortName);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };

  return (
    <div ref={containerRef} className={cn('relative w-64 sm:w-80', className)}>
      <div className="relative flex items-center">
        <Search size={14} className="absolute left-3 text-muted-foreground/70 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder="Search any place or address…"
          className={cn(
            'w-full pl-9 pr-8 h-9 text-xs font-semibold rounded-xl',
            'bg-card/90 backdrop-blur-2xl border border-border/70 text-foreground',
            'placeholder:text-muted-foreground/60 shadow-lg shadow-black/5',
            'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
            'transition-all',
          )}
        />
        {isLoading ? (
          <Loader2 size={13} className="absolute right-2.5 animate-spin text-muted-foreground" />
        ) : query ? (
          <button
            onClick={handleClear}
            className="absolute right-2.5 h-4 w-4 rounded-full bg-muted-foreground/20 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X size={10} />
          </button>
        ) : null}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-10.5 left-0 right-0 z-50 bg-card/95 backdrop-blur-2xl border border-border/70 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="p-1 max-h-64 overflow-y-auto divide-y divide-border/20">
            {results.map((item) => (
              <button
                key={item.place_id}
                onClick={() => handleSelect(item)}
                className="w-full flex items-start gap-2.5 p-2.5 text-left rounded-xl hover:bg-muted/70 transition-colors select-none cursor-pointer group"
              >
                <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary/20 transition-colors">
                  <MapPin size={12} className="text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-foreground truncate">
                    {item.display_name.split(',')[0]}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">
                    {item.display_name}
                  </p>
                </div>
                <Navigation2 size={12} className="text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0 mt-1" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
