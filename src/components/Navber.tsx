"use client";

import React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { navItems } from "@/data/navdata";


export function Navber() {
    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-white/40 backdrop-blur-md border-b border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.02)] transition-all duration-300">
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center">
                    <Link href="/" className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                        Platform
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-8">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
                        >
                            {item.name}
                        </Link>
                    ))}

                    <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-white/30">
                        <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                            Sign In
                        </Link>
                        <Link href="/register" className="px-4 py-2 rounded-full bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition-colors shadow-sm">
                            Get Started
                        </Link>
                    </div>
                </div>

                {/* Mobile menu button */}
                <div className="md:hidden flex items-center">
                    <button className="text-slate-600 hover:text-indigo-600 focus:outline-none p-2 rounded-md hover:bg-white/50 transition-colors">
                        <Menu size={24} />
                    </button>
                </div>
            </div>
        </nav>
    );
}
