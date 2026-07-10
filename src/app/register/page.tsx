import { SignUpForm } from "@/components/auth/signup";
import { motion } from "framer-motion";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { UserPlus } from "lucide-react";

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4">
            <div className="w-full max-w-md">
                <Card className="border-0 shadow-2xl bg-white/70 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <CardHeader className="space-y-1 pb-4 text-center">
                        <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-cyan-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4">
                            <UserPlus className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">
                            Create an account
                        </CardTitle>
                        <CardDescription className="text-slate-500 text-base">
                            Enter your details below to get started
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SignUpForm />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
