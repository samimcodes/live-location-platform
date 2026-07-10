"use client";

import React from "react";
import { Search, Bell, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

export function Navbar() {
  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white/40 backdrop-blur-md border-b border-white/20 sticky top-0 z-10 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
            <SearchIcon size={18} />
          </div>
          <Input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 bg-white/50 border-white/30 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 rounded-xl transition-all shadow-sm backdrop-blur-sm"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="relative p-2 rounded-full hover:bg-white/50 transition-colors text-slate-600 hover:text-indigo-600">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white"></span>
        </button>
      </div>
    </header>
  );
}
