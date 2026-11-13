import { useState, useRef, useEffect, useCallback } from 'react';
import { VoiceGender } from '../types';

interface AudioState {
  currentKey: string | null;
  isPlaying: boolean;
  gender: VoiceGender;
  speed: number;
  continuous: boolean;
}

export function useAudio(bookId: number = 2) {
  const [currentKey, setCurrentKey] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gender, setGender] = useState<VoiceGender>(() => {
    return (localStorage.getItem('madinah_voice_gender') as VoiceGender) || 'b'; // default to male
  });
  const [speed, setSpeed] = useState<number>(() => {
    return parseFloat(localStorage.getItem('madinah_audio_speed') || '1.0');
  });
  const [continuous, setContinuous] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const onEndCallbackRef = useRef<(() => void) | null>(null);

  // Initialize Audio element
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const handleEnded = () => {
      setIsPlaying(false);
      if (onEndCallbackRef.current) {
        onEndCallbackRef.current();
      }
    };

    const handleError = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  const play = useCallback((voiceKey: string, onEnd?: () => void, overrideGender?: VoiceGender) => {
    if (!audioRef.current) return;
    const g = overrideGender || gender;
    const finalGender = (bookId === 3 || bookId === 4) ? 'a' : g;
    const audioSrc = `/audio/book${bookId}/${voiceKey}_${finalGender}.mp3`;

    // If currently playing the same sound, pause it
    if (currentKey === voiceKey && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    onEndCallbackRef.current = onEnd || null;
    audioRef.current.src = audioSrc;
    audioRef.current.playbackRate = speed;
    audioRef.current.play().then(() => {
      setCurrentKey(voiceKey);
      setIsPlaying(true);
    }).catch(err => {
      console.warn("Audio playback prevented or missing:", audioSrc, err);
      setIsPlaying(false);
    });
  }, [currentKey, isPlaying, gender, speed, bookId]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentKey(null);
  }, []);

  const changeGender = (newGender: VoiceGender) => {
    setGender(newGender);
    localStorage.setItem('madinah_voice_gender', newGender);
  };

  const changeSpeed = (newSpeed: number) => {
    setSpeed(newSpeed);
    localStorage.setItem('madinah_audio_speed', newSpeed.toString());
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
  };

  return {
    currentKey,
    isPlaying,
    gender,
    speed,
    continuous,
    setContinuous,
    play,
    stop,
    changeGender,
    changeSpeed
  };
}
