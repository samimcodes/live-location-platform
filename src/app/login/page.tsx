"use client";


import { motion } from "framer-motion";

import { SignInForm } from "@/components/auth/signin";

export default function LoginPage() {


    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md"
            >
                <SignInForm />
            </motion.div>
        </div>
    );
}
