'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Navbar } from '@/components/dashboard/navbar';
import CommandPalette from '@/components/dashboard/CommandPalette';
import { useLocationSharing } from '@/hooks/useLocationSharing';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed,         setIsCollapsed]         = useState(false);
  const [mobileSidebarOpen,   setMobileSidebarOpen]   = useState(false);
  const [commandPaletteOpen,  setCommandPaletteOpen]  = useState(false);

  const pathname = usePathname();

  // Map page gets full-bleed layout — no padding, no max-width container
  const isMapPage = pathname === '/dashboard/map';

  // Start GPS + socket location sharing for the whole dashboard
  useLocationSharing();

  // Global Ctrl+K / Cmd+K keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Global Spotlight Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 md:relative md:z-auto
        transform transition-transform duration-300
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <Sidebar
          isCollapsed={isCollapsed}
          toggleSidebar={() => setIsCollapsed(!isCollapsed)}
        />
      </div>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar
          onMobileMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          mobileSidebarOpen={mobileSidebarOpen}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        />

        {isMapPage ? (
          // Map page: full remaining height, no padding, no container
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        ) : (
          // All other pages: scrollable with padding and max-width
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
