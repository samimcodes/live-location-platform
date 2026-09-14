'use client';

import { useState, useRef, useCallback } from 'react';
import { soundFx } from '@/lib/soundFx';
import api from '@/lib/axios';

export interface VoiceRecordState {
  isRecording: boolean;
  recordingDuration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  error: string | null;
  isUploading: boolean;
}

export function useVoiceRecorder() {
  const [state, setState] = useState<VoiceRecordState>({
    isRecording: false,
    recordingDuration: 0,
    audioBlob: null,
    audioUrl: null,
    error: null,
    isUploading: false,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef   = useRef<Blob[]>([]);
  const timerRef         = useRef<NodeJS.Timeout | null>(null);
  const streamRef        = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    setState((prev) => ({ ...prev, error: null, audioBlob: null, audioUrl: null, recordingDuration: 0 }));

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Audio recording is not supported on this browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Determine supported mime type
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')
        ? 'audio/ogg;codecs=opus'
        : '';

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const mime = recorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mime });
        const url  = URL.createObjectURL(blob);
        setState((prev) => ({
          ...prev,
          isRecording: false,
          audioBlob: blob,
          audioUrl: url,
        }));
      };

      recorder.start(100);
      soundFx.playVoiceRecordStart();

      setState((prev) => ({ ...prev, isRecording: true }));

      // Duration counter
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setState((prev) => ({
          ...prev,
          recordingDuration: Math.round((Date.now() - startTime) / 1000),
        }));
      }, 500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Microphone access denied';
      setState((prev) => ({ ...prev, isRecording: false, error: msg }));
    }
  }, []);

  const stopRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== 'inactive') {
        recorder.onstop = () => {
          const mime = recorder.mimeType || 'audio/webm';
          const blob = new Blob(audioChunksRef.current, { type: mime });
          const url  = URL.createObjectURL(blob);
          setState((prev) => ({
            ...prev,
            isRecording: false,
            audioBlob: blob,
            audioUrl: url,
          }));

          // Stop all audio tracks to release microphone
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
          }

          soundFx.playVoiceRecordStop();
          resolve(blob);
        };
        recorder.stop();
      } else {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
        resolve(null);
      }
    });
  }, []);

  const cancelRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    audioChunksRef.current = [];
    setState({
      isRecording: false,
      recordingDuration: 0,
      audioBlob: null,
      audioUrl: null,
      error: null,
      isUploading: false,
    });
  }, []);

  const uploadVoiceNote = useCallback(async (blob: Blob): Promise<string | null> => {
    setState((prev) => ({ ...prev, isUploading: true }));
    try {
      const formData = new FormData();
      const ext = blob.type.includes('ogg') ? 'ogg' : 'webm';
      formData.append('file', blob, `voice-note-${Date.now()}.${ext}`);

      const res = await api.post<{ success: boolean; data: { url?: string; fileUrl?: string } }>(
        '/upload/single',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      return res.data?.data?.url ?? res.data?.data?.fileUrl ?? null;
    } catch (err) {
      console.error('Failed to upload voice note:', err);
      return null;
    } finally {
      setState((prev) => ({ ...prev, isUploading: false }));
    }
  }, []);

  return {
    ...state,
    startRecording,
    stopRecording,
    cancelRecording,
    uploadVoiceNote,
  };
}
