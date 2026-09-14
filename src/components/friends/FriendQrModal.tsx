'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import {
  QrCode, Camera, Upload, Copy, Check, Share2,
  X, Loader2, Sparkles, RefreshCw, UserPlus, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/toast';
import { useAppSelector } from '@/store/store';
import { useSendFriendRequest } from '@/hooks/useFriends';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface FriendQrModalProps {
  open: boolean;
  onClose: () => void;
}

export function FriendQrModal({ open, onClose }: FriendQrModalProps) {
  const { user } = useAppSelector((s) => s.auth);
  const { mutate: sendRequest, isPending: sending } = useSendFriendRequest();

  const [activeTab, setActiveTab] = useState<'my-qr' | 'scan'>('my-qr');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Scanner states
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [scannedUserId, setScannedUserId] = useState<number | null>(null);
  const [scannedUserName, setScannedUserName] = useState<string | null>(null);
  const [requestSent, setRequestSent] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const inviteUrl = typeof window !== 'undefined' && user
    ? `${window.location.origin}/dashboard/friends?invite=${user.id}&name=${encodeURIComponent(user.name || '')}`
    : '';

  // Generate QR code for "My QR"
  useEffect(() => {
    if (!open || !user || !inviteUrl) return;

    QRCode.toDataURL(inviteUrl, {
      width: 320,
      margin: 1.5,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate QR code', err));
  }, [open, user, inviteUrl]);

  // Handle Copy Link
  const handleCopy = useCallback(() => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    toast.success('Invite link copied to clipboard!');
    setTimeout(() => setCopied(false), 2200);
  }, [inviteUrl]);

  // Handle WhatsApp Share
  const handleWhatsAppShare = useCallback(() => {
    if (!inviteUrl) return;
    const text = encodeURIComponent(`Add me on LocaLink to share live location and stay connected! 👇\n${inviteUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  }, [inviteUrl]);

  // Handle Download QR
  const handleDownloadQr = useCallback(() => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `localink-qr-${user?.name || 'invite'}.png`;
    a.click();
    toast.success('QR Code saved to downloads!');
  }, [qrDataUrl, user?.name]);

  // Stop camera stream helper
  const stopCamera = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Parse QR content to detect user invite
  const handleDecodedText = useCallback((data: string) => {
    try {
      let targetId: number | null = null;
      let targetName: string | null = null;

      if (data.includes('invite=')) {
        const url = new URL(data, window.location.origin);
        const inv = url.searchParams.get('invite');
        if (inv && !isNaN(Number(inv))) {
          targetId = Number(inv);
        }
        targetName = url.searchParams.get('name');
      } else if (!isNaN(Number(data))) {
        targetId = Number(data);
      }

      if (targetId) {
        if (targetId === user?.id) {
          toast.error("This is your own QR code!");
          return;
        }
        setScannedUserId(targetId);
        setScannedUserName(targetName || `User #${targetId}`);
        stopCamera();
        toast.success('Friend QR Code detected!');
      } else {
        toast.error('Invalid LocaLink QR code format');
      }
    } catch {
      toast.error('Could not read user from QR code');
    }
  }, [user?.id, stopCamera]);

  // Scan video frames with jsQR
  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animFrameRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });

    if (code && code.data) {
      handleDecodedText(code.data);
      return;
    }

    animFrameRef.current = requestAnimationFrame(scanFrame);
  }, [handleDecodedText]);

  // Start Camera
  const startCamera = useCallback(async () => {
    setCameraError(null);
    setScannedUserId(null);
    setRequestSent(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
        animFrameRef.current = requestAnimationFrame(scanFrame);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Camera access denied or unavailable';
      setCameraError(msg);
      setCameraActive(false);
    }
  }, [facingMode, scanFrame]);

  // Switch between tabs
  useEffect(() => {
    if (open && activeTab === 'scan' && !scannedUserId) {
      void startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [open, activeTab, scannedUserId, startCamera, stopCamera]);

  // Handle Image File Upload Scan
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code && code.data) {
          handleDecodedText(code.data);
        } else {
          toast.error('No QR code found in this image. Please try a clearer picture.');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Trigger Send Request
  const handleSendRequest = () => {
    if (!scannedUserId) return;
    sendRequest(
      { receiverId: scannedUserId },
      {
        onSuccess: () => {
          setRequestSent(true);
          toast.success(`Friend request sent to ${scannedUserName || 'user'}!`);
        },
        onError: (err: unknown) => {
          const axiosErr = err as { response?: { data?: { message?: string } } };
          const msg = axiosErr.response?.data?.message || 'Failed to send request';
          toast.error(msg);
        },
      }
    );
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 16 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-md bg-card border border-border/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-border/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <QrCode size={20} />
              </div>
              <div>
                <h2 className="font-extrabold text-lg text-foreground">QR Connect</h2>
                <p className="text-xs text-muted-foreground">Add friends instantly via QR or link</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex px-6 pt-4 gap-2">
            <button
              onClick={() => {
                setActiveTab('my-qr');
                setScannedUserId(null);
              }}
              className={cn(
                'flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2',
                activeTab === 'my-qr'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/60 text-muted-foreground hover:text-foreground'
              )}
            >
              <QrCode size={15} />
              My QR Code
            </button>
            <button
              onClick={() => setActiveTab('scan')}
              className={cn(
                'flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2',
                activeTab === 'scan'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/60 text-muted-foreground hover:text-foreground'
              )}
            >
              <Camera size={15} />
              Scan QR Code
            </button>
          </div>

          {/* Body content */}
          <div className="p-6">
            {activeTab === 'my-qr' ? (
              <div className="flex flex-col items-center text-center space-y-4">
                {/* User info banner */}
                <div className="flex items-center gap-3 w-full bg-muted/40 p-3 rounded-2xl border border-border/40">
                  <div className="h-11 w-11 rounded-xl bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0 overflow-hidden relative">
                    {user?.avatar ? (
                      <Image src={user.avatar} alt={user.name} fill className="object-cover" />
                    ) : (
                      <span>{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                    )}
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <p className="text-sm font-bold truncate text-foreground">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold border border-emerald-500/20 shrink-0">
                    Active
                  </span>
                </div>

                {/* QR Code Container */}
                <div className="p-4 bg-white rounded-3xl shadow-md border border-border/30 flex items-center justify-center relative group">
                  {qrDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={qrDataUrl} alt="My QR Code" className="w-56 h-56 object-contain rounded-xl" />
                  ) : (
                    <div className="w-56 h-56 flex items-center justify-center">
                      <Loader2 className="animate-spin text-muted-foreground" size={32} />
                    </div>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  Ask your friend to scan this QR code with their camera or LocaLink scanner.
                </p>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 w-full pt-1">
                  <Button
                    variant="outline"
                    onClick={handleCopy}
                    className="h-10 text-xs font-bold rounded-xl gap-1.5"
                  >
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy Link'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleWhatsAppShare}
                    className="h-10 text-xs font-bold rounded-xl gap-1.5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20"
                  >
                    <Share2 size={14} />
                    WhatsApp
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownloadQr}
                  className="text-xs text-muted-foreground hover:text-foreground h-8"
                >
                  Download QR Image
                </Button>
              </div>
            ) : (
              /* SCAN TAB */
              <div className="flex flex-col items-center text-center space-y-4">
                {scannedUserId ? (
                  /* Success / Found card */
                  <div className="w-full bg-muted/40 border border-border/50 rounded-2xl p-6 text-center space-y-4">
                    <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                      <Sparkles size={28} />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-foreground">Friend Profile Found!</h3>
                      <p className="text-sm font-semibold text-primary mt-1">{scannedUserName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">ID: #{scannedUserId}</p>
                    </div>

                    {requestSent ? (
                      <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                        <Check size={15} />
                        Request Sent Successfully!
                      </div>
                    ) : (
                      <Button
                        onClick={handleSendRequest}
                        disabled={sending}
                        className="w-full h-10 font-bold rounded-xl gap-2 shadow-md shadow-primary/20"
                      >
                        {sending ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                        Send Friend Request
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setScannedUserId(null);
                        setRequestSent(false);
                        void startCamera();
                      }}
                      className="text-xs text-muted-foreground"
                    >
                      Scan Another Code
                    </Button>
                  </div>
                ) : (
                  /* Camera preview & upload */
                  <div className="w-full space-y-3">
                    <div className="relative w-full aspect-square max-w-[280px] mx-auto bg-black rounded-3xl overflow-hidden border-2 border-primary/40 shadow-inner flex items-center justify-center">
                      {cameraError ? (
                        <div className="p-4 text-center space-y-2">
                          <AlertCircle size={32} className="text-destructive mx-auto" />
                          <p className="text-xs text-destructive font-medium">{cameraError}</p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => void startCamera()}
                            className="text-xs h-8 gap-1.5"
                          >
                            <RefreshCw size={12} />
                            Try Again
                          </Button>
                        </div>
                      ) : (
                        <>
                          <video
                            ref={videoRef}
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                          />
                          <canvas ref={canvasRef} className="hidden" />

                          {/* Scanning overlay bracket */}
                          <div className="absolute inset-8 border-2 border-primary/70 rounded-2xl pointer-events-none flex flex-col justify-between p-2">
                            <div className="w-full flex justify-between">
                              <div className="w-4 h-4 border-t-2 border-l-2 border-primary" />
                              <div className="w-4 h-4 border-t-2 border-r-2 border-primary" />
                            </div>
                            {/* Animated scanner laser bar */}
                            <motion.div
                              animate={{ y: [0, 160, 0] }}
                              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                              className="h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent w-full shadow-lg shadow-primary"
                            />
                            <div className="w-full flex justify-between">
                              <div className="w-4 h-4 border-b-2 border-l-2 border-primary" />
                              <div className="w-4 h-4 border-b-2 border-r-2 border-primary" />
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
                          stopCamera();
                          setTimeout(() => void startCamera(), 200);
                        }}
                        className="text-xs h-8 rounded-xl gap-1.5"
                      >
                        <RefreshCw size={13} />
                        Flip Camera
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs h-8 rounded-xl gap-1.5"
                      >
                        <Upload size={13} />
                        Upload Image
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
