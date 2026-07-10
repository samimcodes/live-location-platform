"use client";

import React from "react";
import Link from "next/link";
// import { Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
    return (
        <footer className="w-full relative z-10 border-t border-white/20 bg-white/40 backdrop-blur-md">
            <div className="max-w-6xl mx-auto px-6 py-8 md:py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-2">
                        <span className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                            Platform
                        </span>
                        <p className="mt-4 text-slate-600 max-w-sm">
                            Empowering your digital journey with modern, scalable, and beautiful solutions.
                        </p>
                        <div className="flex space-x-4 mt-6">
                            <a href="#" className="text-slate-400 hover:text-indigo-500 transition-colors">
                                {/* <Twitter size={20} /> */}
                            </a>
                            <a href="#" className="text-slate-400 hover:text-indigo-500 transition-colors">
                                {/* <Github size={20} /> */}
                            </a>
                            <a href="#" className="text-slate-400 hover:text-indigo-500 transition-colors">
                                {/* <Linkedin size={20} /> */}
                            </a>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-slate-800 mb-4">Resources</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="#" className="text-slate-600 hover:text-indigo-600 transition-colors">Documentation</Link>
                            </li>
                            <li>
                                <Link href="#" className="text-slate-600 hover:text-indigo-600 transition-colors">Blog</Link>
                            </li>
                            <li>
                                <Link href="#" className="text-slate-600 hover:text-indigo-600 transition-colors">Support</Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-slate-800 mb-4">Legal</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="#" className="text-slate-600 hover:text-indigo-600 transition-colors">Privacy Policy</Link>
                            </li>
                            <li>
                                <Link href="#" className="text-slate-600 hover:text-indigo-600 transition-colors">Terms of Service</Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/20 text-center md:flex md:justify-between md:text-left">
                    <p className="text-slate-500 text-sm">
                        &copy; {new Date().getFullYear()} Platform Inc. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
