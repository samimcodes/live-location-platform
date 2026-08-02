'use client';

import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/store';
import { setUser } from '@/store/slices/authSlice';
import { setTheme } from '@/store/slices/appSlice';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Lock, Bell, Map, Sun, Moon, Monitor, Shield } from 'lucide-react';
import { toast } from '@/lib/toast';
import { motion } from 'framer-motion';
import api from '@/lib/axios';
import { useLocationStore } from '@/store/useLocationStore';
import { useMutation } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const theme = useAppSelector((s) => s.app.theme);
  const { isSharing, setSharing } = useLocationStore();

  const [profile, setProfile] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    bio: user?.bio ?? '',
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Update profile
  const { mutate: updateProfile, isPending: savingProfile } = useMutation({
    mutationFn: async () => {
      const { data } = await api.patch('/users/profile', profile);
      return data;
    },
    onSuccess: (data) => {
      if (data.success && data.data) dispatch(setUser(data.data));
      toast.success('Profile updated!');
    },
    onError: () => toast.error('Failed to update profile'),
  });

  // Update password
  const { mutate: updatePassword, isPending: savingPassword } = useMutation({
    mutationFn: async () => {
      const { data } = await api.patch('/auth/update-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      return data;
    },
    onSuccess: () => {
      toast.success('Password updated!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to update password');
    },
  });

  // Toggle location sharing
  const { mutate: toggleSharing } = useMutation({
    mutationFn: async (sharing: boolean) => {
      const { data } = await api.patch('/location/sharing', { sharing });
      return data;
    },
    onSuccess: (_, sharing) => {
      setSharing(sharing);
      toast.success(`Location sharing ${sharing ? 'enabled' : 'disabled'}`);
    },
  });

  const handleThemeChange = (t: 'light' | 'dark' | 'system') => {
    dispatch(setTheme(t));
    if (typeof document !== 'undefined') {
      if (t === 'dark') document.documentElement.classList.add('dark');
      else if (t === 'light') document.documentElement.classList.remove('dark');
      else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark', prefersDark);
      }
    }
  };

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'location', label: 'Location', icon: Map },
    { id: 'appearance', label: 'Appearance', icon: Sun },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <User size={15} className="text-primary" />
              Profile
            </CardTitle>
            <CardDescription className="text-xs">Update your display name and contact info</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Avatar placeholder */}
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.charAt(0) ?? 'U'}
              </div>
              <div>
                <p className="font-semibold">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Bio</Label>
              <Input
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="A short bio about yourself"
              />
            </div>
            <Button size="sm" onClick={() => updateProfile()} disabled={savingProfile}>
              {savingProfile ? 'Saving…' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Password */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Lock size={15} className="text-primary" />
              Security
            </CardTitle>
            <CardDescription className="text-xs">Change your account password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Current Password</Label>
              <Input
                type="password"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>New Password</Label>
                <Input
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  placeholder="Min 6 characters"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Confirm New Password</Label>
                <Input
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => updatePassword()}
              disabled={
                savingPassword ||
                !passwords.currentPassword ||
                !passwords.newPassword ||
                passwords.newPassword !== passwords.confirmPassword
              }
            >
              {savingPassword ? 'Updating…' : 'Update Password'}
            </Button>
            {passwords.newPassword && passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword && (
              <p className="text-xs text-destructive">Passwords do not match</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Location Sharing */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Map size={15} className="text-primary" />
              Location Privacy
            </CardTitle>
            <CardDescription className="text-xs">Control who can see your location</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Share my location</p>
                <p className="text-xs text-muted-foreground">
                  {isSharing
                    ? 'Your friends can see you on the map'
                    : 'You are invisible on your friends\' maps'}
                </p>
              </div>
              <button
                onClick={() => toggleSharing(!isSharing)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none',
                  isSharing ? 'bg-primary' : 'bg-muted-foreground/30'
                )}
                role="switch"
                aria-checked={isSharing}
              >
                <span className={cn(
                  'inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
                  isSharing ? 'translate-x-6' : 'translate-x-1'
                )} />
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Appearance */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Sun size={15} className="text-primary" />
              Appearance
            </CardTitle>
            <CardDescription className="text-xs">Choose your preferred theme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              {([
                { value: 'light', label: 'Light', icon: Sun },
                { value: 'dark', label: 'Dark', icon: Moon },
                { value: 'system', label: 'System', icon: Monitor },
              ] as const).map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => handleThemeChange(value)}
                  className={cn(
                    'flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border transition-all',
                    theme === value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:bg-muted'
                  )}
                >
                  <Icon size={18} />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
