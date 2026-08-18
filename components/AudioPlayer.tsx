"use client";

import { useState } from "react";

export function AudioPlayer({ word, label = "Hear pronunciation" }: { word: string; label?: string }) {
  const [playing, setPlaying] = useState(false);
  function speak() {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "ksw";
    utterance.onend = () => setPlaying(false);
    setPlaying(true);
    window.speechSynthesis.speak(utterance);
  }
  return <button className="audio-button" type="button" onClick={speak} aria-pressed={playing}><span aria-hidden="true" />{playing ? "Playing…" : label}</button>;
}
