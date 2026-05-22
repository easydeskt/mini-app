import { useRef, useState } from 'react';

export function useAudioPlayer() {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      void audio.play().catch(() => {});
      setPlaying(true);
    }
  }

  function pause() {
    audioRef.current?.pause();
    setPlaying(false);
  }

  function onEnded() {
    setPlaying(false);
  }

  return { playing, setPlaying, audioRef, toggle, pause, onEnded };
}
