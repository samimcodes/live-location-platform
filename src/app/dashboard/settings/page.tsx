'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useTheme } from '@/components/ThemeProvider';
import { useAppSelector, useAppDispatch } from '@/store/store';
import { setUser, clearAuth } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  User, Lock, MapPin, Sun, Moon, Monitor,
  Camera, Loader2, AlertTriangle, Check, X,
  Settings as SettingsIcon, Save, Eye, EyeOff,
  Shield, Mail, Phone, LogOut, CheckCircle2,
} from 'lucide-react';
import { toast } from '@/lib/toast';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/axios';
import { useLocationStore } from '@/store/useLocationStore';
import { useMutation } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

// ── Password strength checker ──────────────────────────────────────────────
interface StrengthRule {
  label: string;
  test: (p: string) => boolean;
}

const PASSWORD_RULES: StrengthRule[] = [
  { label: 'At least 8 characters',       test: (p) => p.length >= 8 },
  { label: 'One uppercase letter (A–Z)',  test: (p) => /[A-Z]/.test(p) },
  { label: 'One number (0–9)',            test: (p) => /[0-9]/.test(p) },
  { label: 'One special character (!@#…)', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500'];
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="space-y-3 pt-1">
      {/* Strength bar */}
      <div className="flex gap-1.5">
        {PASSWORD_RULES.map((_, i) => (
          <div
            key={i}
            className={cn(
              'flex-1 h-1.5 rounded-full transition-all duration-500 ease-out',
              i < passed ? colors[passed - 1] : 'bg-muted'
            )}
          />
        ))}
      </div>
      
      <div className="flex items-center justify-between">
        <p className={cn('text-xs font-bold uppercase tracking-wider', passed < 2 ? 'text-red-500' : passed < 4 ? 'text-yellow-600' : 'text-emerald-600')}>
          {labels[passed - 1] ?? 'Too weak'}
        </p>
      </div>

      {/* Rules checklist */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
        {PASSWORD_RULES.map((rule) => {
          const ok = rule.test(password);
          return (
            <li key={rule.label} className={cn(
              'flex items-center gap-2 text-[11px] font-medium transition-colors',
              ok ? 'text-emerald-600 dark:text-emerald-500' : 'text-muted-foreground/60'
            )}>
              <div className={cn(
                "h-3.5 w-3.5 rounded-full flex items-center justify-center shrink-0",
                ok ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400" : "bg-muted text-muted-foreground/40"
              )}>
                {ok ? <Check size={8} strokeWidth={3} /> : <X size={8} strokeWidth={3} />}
              </div>
              {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const dispatch   = useAppDispatch();
  const router     = useRouter();
  const { theme, setTheme } = useTheme();
  const user       = useAppSelector((s) => s.auth.user);
  const { isSharing, setSharing } = useLocationStore();

  // ── Profile form — syncs when Redux user changes ───────────────────────
  const [profile, setProfile] = useState({
    name:  user?.name  ?? '',
    phone: user?.phone ?? '',
    bio:   user?.bio   ?? '',
  });

  useEffect(() => {
    setProfile({
      name:  user?.name  ?? '',
      phone: user?.phone ?? '',
      bio:   user?.bio   ?? '',
    });
  }, [user?.name, user?.phone, user?.bio]);

  // Check if profile was changed
  const isProfileChanged = 
    profile.name.trim() !== (user?.name ?? '') ||
    profile.phone.trim() !== (user?.phone ?? '') ||
    profile.bio.trim() !== (user?.bio ?? '');

  // ── Avatar upload ──────────────────────────────────────────────────────
  const fileInputRef  = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Upload
    const formData = new FormData();
    formData.append('file', file);
    setUploadingAvatar(true);
    try {
      const { data } = await api.post('/upload/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const rawUrl: string = data.data.url;
      const url = rawUrl.startsWith('http')
        ? rawUrl
        : `${window.location.origin}${rawUrl}`;

      // Save avatar URL to profile
      const { data: profileData } = await api.patch('/users/profile', { avatar: url });
      if (profileData.success && profileData.data) dispatch(setUser(profileData.data));
      toast.success('Profile photo updated!');
    } catch {
      toast.error('Failed to upload photo');
      setAvatarPreview(null);
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── Profile save ───────────────────────────────────────────────────────
  const { mutate: updateProfile, isPending: savingProfile } = useMutation({
    mutationFn: async () => {
      const { data } = await api.patch('/users/profile', {
        name:  profile.name.trim(),
        phone: profile.phone.trim() || null,
        bio:   profile.bio.trim() || null,
      });
      return data;
    },
    onSuccess: (data) => {
      if (data.success && data.data) dispatch(setUser(data.data));
      toast.success('Profile details saved!');
    },
    onError: () => toast.error('Failed to update profile'),
  });

  // ── Password state & visibility ────────────────────────────────────────
  const [passwords, setPasswords] = useState({
    currentPassword:  '',
    newPassword:      '',
    confirmPassword:  '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword,     setShowNewPassword]     = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const allRulesPassed = PASSWORD_RULES.every((r) => r.test(passwords.newPassword));
  const passwordsMatch = passwords.newPassword === passwords.confirmPassword;
  const canChangePassword =
    passwords.currentPassword &&
    passwords.newPassword &&
    passwords.confirmPassword &&
    allRulesPassed &&
    passwordsMatch;

  const { mutate: updatePassword, isPending: savingPassword } = useMutation({
    mutationFn: async () => {
      const { data } = await api.patch('/auth/update-password', {
        currentPassword: passwords.currentPassword,
        newPassword:     passwords.newPassword,
      });
      return data;
    },
    onSuccess: () => {
      toast.success('Password updated successfully!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Incorrect current password');
    },
  });

  // ── Location sharing toggle ────────────────────────────────────────────
  const { mutate: toggleSharing, isPending: togglingSharing } = useMutation({
    mutationFn: async (sharing: boolean) => {
      const { data } = await api.patch('/location/sharing', { sharing });
      return { data, sharing };
    },
    onSuccess: ({ sharing }) => {
      setSharing(sharing);
      toast.success(`Live location sharing ${sharing ? 'enabled' : 'disabled'}`);
    },
    onError: () => toast.error('Failed to update sharing preference'),
  });

  // ── Logout ─────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    localStorage.removeItem('token');
    dispatch(clearAuth());
    router.push('/login');
    toast.success('Logged out successfully');
  };

  // ── Delete account ─────────────────────────────────────────────────────
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const DELETE_CONFIRM_PHRASE = 'delete my account';

  const { mutate: deleteAccount, isPending: deletingAccount } = useMutation({
    mutationFn: async () => {
      await api.delete(`/users/${user?.id}`);
    },
    onSuccess: () => {
      toast.success('Account permanently deleted');
      localStorage.removeItem('token');
      dispatch(clearAuth());
      router.push('/login');
    },
    onError: () => toast.error('Failed to delete account'),
  });

  const handleDeleteAccount = () => {
    if (deleteConfirmText !== DELETE_CONFIRM_PHRASE) return;
    deleteAccount();
  };

  // ── Derived display avatar ─────────────────────────────────────────────
  const displayAvatar = avatarPreview ?? user?.avatar ?? null;
  const initials      = (user?.name ?? 'U').charAt(0).toUpperCase();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* ── HEADER — Premium Banner ────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="relative rounded-2xl overflow-hidden welcome-gradient border shadow-sm">
          <div className="relative z-10 px-6 py-6 sm:px-8 sm:py-7">
            <div className="flex items-start sm:items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 flex items-center justify-center shadow-lg shadow-slate-900/25 shrink-0 text-white">
                  <SettingsIcon size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Manage your personal profile, security credentials, and app preferences
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-1.5 rounded-xl h-10 px-4 text-muted-foreground hover:text-destructive border-border/60 hover:bg-destructive/10"
              >
                <LogOut size={14} />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ── MAIN COLUMN (Profile & Security) ───────────────────────── */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* ── Profile Information ── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
              <div className="px-6 py-4 flex items-center gap-3 border-b border-border/30 bg-muted/10">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center">
                  <User size={15} className="text-indigo-500" />
                </div>
                <div>
                  <h2 className="text-sm font-bold">Personal Information</h2>
                  <p className="text-[11px] text-muted-foreground">Update your photo and display details</p>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Avatar with hover upload overlay */}
                <div className="flex items-center gap-5">
                  <div className="relative group shrink-0">
                    <div className="h-20 w-20 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md ring-4 ring-background border border-border/10">
                      {displayAvatar ? (
                        <Image
                          src={displayAvatar}
                          alt={user?.name ?? 'Avatar'}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-white text-3xl font-bold">{initials}</span>
                      )}
                      
                      <AnimatePresence>
                        {uploadingAvatar && (
                          <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
                          >
                            <Loader2 size={24} className="animate-spin text-white" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {!uploadingAvatar && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-1 -right-1 h-7 w-7 bg-primary text-primary-foreground rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform ring-2 ring-background cursor-pointer"
                        title="Upload new photo"
                      >
                        <Camera size={13} />
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleAvatarSelect}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-lg truncate">{user?.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                      <CheckCircle2 size={11} /> Verified Account
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name</Label>
                      <Input
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        placeholder="John Doe"
                        className="h-11 rounded-xl bg-muted/40 focus:bg-card border-border/60"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Phone <span className="normal-case font-normal opacity-60">(Optional)</span>
                      </Label>
                      <Input
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        placeholder="+880 1234 567890"
                        className="h-11 rounded-xl bg-muted/40 focus:bg-card border-border/60"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Bio <span className="normal-case font-normal opacity-60">(Optional)</span>
                    </Label>
                    <Input
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      placeholder="Share a short bio or status"
                      className="h-11 rounded-xl bg-muted/40 focus:bg-card border-border/60"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end pt-2 border-t border-border/30">
                  <Button
                    className="rounded-xl shadow-sm gap-2 h-10 px-5 font-semibold"
                    onClick={() => updateProfile()}
                    disabled={savingProfile || !profile.name.trim() || !isProfileChanged}
                  >
                    {savingProfile
                      ? <><Loader2 size={14} className="animate-spin" />Saving…</>
                      : <><Save size={14} />Save Changes</>
                    }
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Password & Security ── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
              <div className="px-6 py-4 flex items-center gap-3 border-b border-border/30 bg-muted/10">
                <div className="h-8 w-8 rounded-lg bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center">
                  <Lock size={15} className="text-orange-500" />
                </div>
                <div>
                  <h2 className="text-sm font-bold">Password & Security</h2>
                  <p className="text-[11px] text-muted-foreground">Keep your authentication credentials protected</p>
                </div>
              </div>
              
              <div className="p-6 space-y-5">
                {/* Current password with visibility toggle */}
                <div className="space-y-1.5 max-w-sm">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Password</Label>
                  <div className="relative">
                    <Input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwords.currentPassword}
                      onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="h-11 rounded-xl bg-muted/40 focus:bg-card border-border/60 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground"
                    >
                      {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-border/30">
                  <div className="space-y-4">
                    {/* New password */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">New Password</Label>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwords.newPassword}
                          onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                          placeholder="Min 8 characters"
                          autoComplete="new-password"
                          className="h-11 rounded-xl bg-muted/40 focus:bg-card border-border/60 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground"
                        >
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm password */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={passwords.confirmPassword}
                          onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          className={cn(
                            'h-11 rounded-xl bg-muted/40 focus:bg-card border-border/60 pr-10 transition-colors',
                            passwords.confirmPassword && !passwordsMatch
                              ? 'border-destructive focus-visible:ring-destructive bg-destructive/5'
                              : passwords.confirmPassword && passwordsMatch
                              ? 'border-emerald-500/60 focus-visible:ring-emerald-500 bg-emerald-500/5'
                              : ''
                          )}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground"
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <AnimatePresence>
                        {passwords.confirmPassword && !passwordsMatch && (
                          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-[11px] font-medium text-destructive mt-1 flex items-center gap-1">
                            <AlertTriangle size={11} /> Passwords do not match
                          </motion.p>
                        )}
                        {passwords.confirmPassword && passwordsMatch && passwords.newPassword && (
                          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-[11px] font-medium text-emerald-600 dark:text-emerald-500 mt-1 flex items-center gap-1">
                            <Check size={11} /> Passwords match
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  
                  {/* Strength Checker */}
                  <div className="bg-muted/20 p-4 rounded-xl border border-border/50">
                    <h4 className="text-xs font-semibold mb-3">Password Requirements</h4>
                    <PasswordStrength password={passwords.newPassword} />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    className="rounded-xl shadow-sm h-10 px-5 font-semibold"
                    onClick={() => updatePassword()}
                    disabled={!canChangePassword || savingPassword}
                  >
                    {savingPassword
                      ? <><Loader2 size={14} className="mr-2 animate-spin" />Updating…</>
                      : 'Update Password'
                    }
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── SIDE COLUMN (Preferences & Danger Zone) ────────────────── */}
        <div className="lg:col-span-5 space-y-6">

          {/* ── Privacy & Live Location ── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
              <div className="px-5 py-4 flex items-center gap-3 border-b border-border/30 bg-muted/10">
                <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                  <MapPin size={15} className="text-emerald-500" />
                </div>
                <h2 className="text-sm font-bold">Privacy & Sharing</h2>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-border/50 bg-muted/20">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-foreground">Live Location</p>
                      {isSharing && (
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                      {isSharing
                        ? 'Your friends and group members can see your live position on the map.'
                        : 'Ghost Mode is active. You are currently hidden from all friend maps.'}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleSharing(!isSharing)}
                    disabled={togglingSharing}
                    className={cn(
                      'relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus-visible:outline-none disabled:opacity-60 shrink-0 mt-1 cursor-pointer',
                      isSharing ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                    )}
                    role="switch"
                    aria-checked={isSharing}
                  >
                    <span className={cn(
                      'inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform',
                      isSharing ? 'translate-x-6' : 'translate-x-1'
                    )} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Appearance & Theme ── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
              <div className="px-5 py-4 flex items-center gap-3 border-b border-border/30 bg-muted/10">
                <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                  <Sun size={15} className="text-blue-500" />
                </div>
                <h2 className="text-sm font-bold">Appearance</h2>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { value: 'light',  label: 'Light',  icon: Sun     },
                    { value: 'dark',   label: 'Dark',   icon: Moon    },
                    { value: 'system', label: 'System', icon: Monitor },
                  ] as const).map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setTheme(value)}
                      className={cn(
                        'flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border transition-all cursor-pointer',
                        theme === value
                          ? 'border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary/30 font-bold'
                          : 'border-border/60 hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Icon size={18} className={theme === value ? 'text-primary' : ''} />
                      <span className="text-[11px] uppercase tracking-wider">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Danger Zone ── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <div className="rounded-2xl border border-destructive/30 bg-card shadow-sm overflow-hidden">
              <div className="px-5 py-4 flex items-center gap-3 border-b border-destructive/20 bg-destructive/[0.03]">
                <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle size={15} className="text-destructive" />
                </div>
                <h2 className="text-sm font-bold text-destructive">Danger Zone</h2>
              </div>
              
              <div className="p-5">
                <div className="rounded-xl border border-destructive/20 bg-destructive/[0.02] p-4 space-y-4">
                  <div>
                    <p className="text-sm font-bold text-destructive">Delete Account</p>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                      Permanently delete your user profile, friends, groups, and location logs.
                      <strong className="text-foreground font-semibold"> This cannot be recovered.</strong>
                    </p>
                  </div>
                  
                  <div className="space-y-2 pt-2 border-t border-destructive/10">
                    <Label className="text-[11px] font-semibold text-muted-foreground">
                      Type <span className="font-mono font-bold text-destructive select-all bg-destructive/10 px-1 py-0.5 rounded mx-0.5">{DELETE_CONFIRM_PHRASE}</span> to confirm
                    </Label>
                    <Input
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder={DELETE_CONFIRM_PHRASE}
                      className="border-destructive/30 focus-visible:ring-destructive h-10 rounded-xl font-mono text-sm bg-card"
                    />
                  </div>
                  
                  <Button
                    variant="destructive"
                    className="w-full rounded-xl shadow-sm h-10 font-semibold"
                    disabled={deleteConfirmText !== DELETE_CONFIRM_PHRASE || deletingAccount}
                    onClick={handleDeleteAccount}
                  >
                    {deletingAccount
                      ? <><Loader2 size={14} className="mr-2 animate-spin" />Deleting permanently…</>
                      : 'Delete my account permanently'
                    }
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </div>
  );
}
