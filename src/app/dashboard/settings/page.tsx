'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useTheme } from '@/components/ThemeProvider';
import { useAppSelector, useAppDispatch } from '@/store/store';
import { setUser, clearAuth } from '@/store/slices/authSlice';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  User, Lock, MapPin, Sun, Moon, Monitor,
  Camera, Loader2, AlertTriangle, Check, X,
} from 'lucide-react';
import { toast } from '@/lib/toast';
import { motion } from 'framer-motion';
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
  { label: 'At least 8 characters',      test: (p) => p.length >= 8 },
  { label: 'One uppercase letter (A–Z)',  test: (p) => /[A-Z]/.test(p) },
  { label: 'One number (0–9)',            test: (p) => /[0-9]/.test(p) },
  { label: 'One special character (!@#…)',test: (p) => /[^A-Za-z0-9]/.test(p) },
];

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500'];
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="space-y-2 mt-1">
      {/* Strength bar */}
      <div className="flex gap-1">
        {PASSWORD_RULES.map((_, i) => (
          <div
            key={i}
            className={cn(
              'flex-1 h-1 rounded-full transition-all duration-300',
              i < passed ? colors[passed - 1] : 'bg-muted'
            )}
          />
        ))}
      </div>
      {/* Label */}
      <p className={cn('text-xs font-medium', passed < 2 ? 'text-red-500' : passed < 4 ? 'text-yellow-600' : 'text-emerald-600')}>
        {labels[passed - 1] ?? 'Too weak'}
      </p>
      {/* Rules checklist */}
      <ul className="space-y-1">
        {PASSWORD_RULES.map((rule) => {
          const ok = rule.test(password);
          return (
            <li key={rule.label} className={cn('flex items-center gap-1.5 text-xs', ok ? 'text-emerald-600' : 'text-muted-foreground')}>
              {ok ? <Check size={11} /> : <X size={11} />}
              {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
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

    // Upload — endpoint is /api/v1/upload/single with field name 'file'
    const formData = new FormData();
    formData.append('file', file);
    setUploadingAvatar(true);
    try {
      const { data } = await api.post('/upload/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const rawUrl: string = data.data.url;
      // Normalize: if backend returns a relative path like /uploads/…
      // prefix it with the current origin so next/image can load it.
      const url = rawUrl.startsWith('http')
        ? rawUrl
        : `${window.location.origin}${rawUrl}`;

      // Save avatar URL to profile
      const { data: profileData } = await api.patch('/users/profile', { avatar: url });
      if (profileData.success && profileData.data) dispatch(setUser(profileData.data));
      toast.success('Avatar updated');
    } catch {
      toast.error('Failed to upload avatar');
      setAvatarPreview(null);
    } finally {
      setUploadingAvatar(false);
      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── Profile save ───────────────────────────────────────────────────────
  const { mutate: updateProfile, isPending: savingProfile } = useMutation({
    mutationFn: async () => {
      const { data } = await api.patch('/users/profile', {
        name:  profile.name.trim()  || undefined,
        phone: profile.phone.trim() || undefined,
        bio:   profile.bio.trim()   || undefined,
      });
      return data;
    },
    onSuccess: (data) => {
      if (data.success && data.data) dispatch(setUser(data.data));
      toast.success('Profile updated!');
    },
    onError: () => toast.error('Failed to update profile'),
  });

  // ── Password ───────────────────────────────────────────────────────────
  const [passwords, setPasswords] = useState({
    currentPassword:  '',
    newPassword:      '',
    confirmPassword:  '',
  });

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
      toast.success('Password updated!');
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
      toast.success(`Location sharing ${sharing ? 'enabled' : 'disabled'}`);
    },
    onError: () => toast.error('Failed to update sharing preference'),
  });

  // ── Delete account ─────────────────────────────────────────────────────
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const DELETE_CONFIRM_PHRASE = 'delete my account';

  const { mutate: deleteAccount, isPending: deletingAccount } = useMutation({
    mutationFn: async () => {
      await api.delete(`/users/${user?.id}`);
    },
    onSuccess: () => {
      toast.success('Account deleted');
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
    <div className="space-y-5 max-w-2xl">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* ── Profile ───────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <User size={15} className="text-primary" />
              Profile
            </CardTitle>
            <CardDescription className="text-xs">
              Update your display name, photo, and contact info
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Avatar + basic info */}
            <div className="flex items-center gap-4">
              {/* Avatar with upload overlay */}
              <div className="relative group shrink-0">
                <div className="h-16 w-16 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  {displayAvatar ? (
                    <Image
                      src={displayAvatar}
                      alt={user?.name ?? 'Avatar'}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-white text-2xl font-bold">{initials}</span>
                  )}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl">
                      <Loader2 size={18} className="animate-spin text-white" />
                    </div>
                  )}
                </div>
                {/* Upload button overlay */}
                {!uploadingAvatar && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/0 group-hover:bg-black/40 rounded-2xl transition-all flex items-center justify-center"
                    title="Change avatar"
                  >
                    <Camera size={18} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
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

              <div>
                <p className="font-semibold">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-primary hover:underline mt-0.5"
                  disabled={uploadingAvatar}
                >
                  Change photo
                </button>
              </div>
            </div>

            {/* Fields */}
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
                  placeholder="+880 1234 567890"
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
            <Button
              size="sm"
              onClick={() => updateProfile()}
              disabled={savingProfile || !profile.name.trim()}
            >
              {savingProfile
                ? <><Loader2 size={13} className="mr-2 animate-spin" />Saving…</>
                : 'Save Changes'
              }
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Security ──────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
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
                autoComplete="current-password"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>New Password</Label>
                <Input
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  placeholder="Min 8 characters"
                  autoComplete="new-password"
                />
                <PasswordStrength password={passwords.newPassword} />
              </div>
              <div className="space-y-1.5">
                <Label>Confirm New Password</Label>
                <Input
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className={cn(
                    passwords.confirmPassword && !passwordsMatch
                      ? 'border-destructive focus-visible:ring-destructive'
                      : ''
                  )}
                />
                {passwords.confirmPassword && !passwordsMatch && (
                  <p className="text-xs text-destructive">Passwords do not match</p>
                )}
                {passwords.confirmPassword && passwordsMatch && passwords.newPassword && (
                  <p className="text-xs text-emerald-600 flex items-center gap-1">
                    <Check size={11} /> Passwords match
                  </p>
                )}
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => updatePassword()}
              disabled={!canChangePassword || savingPassword}
            >
              {savingPassword
                ? <><Loader2 size={13} className="mr-2 animate-spin" />Updating…</>
                : 'Update Password'
              }
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Location Privacy ──────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin size={15} className="text-primary" />
              Location Privacy
            </CardTitle>
            <CardDescription className="text-xs">
              Control who can see your live location
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-medium">Share my location</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isSharing
                    ? 'Your friends can see you on the map'
                    : "You are invisible on your friends' maps"}
                </p>
              </div>
              <button
                onClick={() => toggleSharing(!isSharing)}
                disabled={togglingSharing}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none disabled:opacity-60',
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

      {/* ── Appearance ────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
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
                { value: 'light',  label: 'Light',  icon: Sun     },
                { value: 'dark',   label: 'Dark',   icon: Moon    },
                { value: 'system', label: 'System', icon: Monitor },
              ] as const).map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
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

      {/* ── Danger Zone ───────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2 text-destructive">
              <AlertTriangle size={15} />
              Danger Zone
            </CardTitle>
            <CardDescription className="text-xs">
              Permanently delete your account and all your data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-3">
              <p className="text-sm font-medium">Delete Account</p>
              <p className="text-xs text-muted-foreground">
                This will permanently delete your profile, location history, saved places, groups, and all other data.
                <strong className="text-foreground"> This action cannot be undone.</strong>
              </p>
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Type <span className="font-mono font-bold text-destructive">{DELETE_CONFIRM_PHRASE}</span> to confirm
                </Label>
                <Input
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder={DELETE_CONFIRM_PHRASE}
                  className="border-destructive/40 focus-visible:ring-destructive"
                />
              </div>
              <Button
                variant="destructive"
                size="sm"
                disabled={deleteConfirmText !== DELETE_CONFIRM_PHRASE || deletingAccount}
                onClick={handleDeleteAccount}
              >
                {deletingAccount
                  ? <><Loader2 size={13} className="mr-2 animate-spin" />Deleting…</>
                  : 'Delete my account'
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
