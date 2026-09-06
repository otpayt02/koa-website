"use client";

import { useRef, useState } from "react";
import type { Lang, Messages } from "./i18n";

export function AudioRecorder({ lang, messages }: { lang: Lang; messages: Messages }) {
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const [status, setStatus] = useState<"idle" | "recording" | "ready" | "uploading" | "done" | "error">("idle");
  const [url, setUrl] = useState<string>();

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunks.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (event) => chunks.current.push(event.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: mediaRecorder.mimeType });
        setUrl(URL.createObjectURL(blob));
        setStatus("ready");
        stream.getTracks().forEach((track) => track.stop());
      };
      mediaRecorder.start();
      recorder.current = mediaRecorder;
      setStatus("recording");
    } catch {
      setStatus("error");
    }
  }

  async function upload() {
    if (!url) return;
    setStatus("uploading");
    try {
      const blob = await fetch(url).then((response) => response.blob());
      const body = new FormData();
      body.append("audio", blob, "karen-recording.webm");
      body.append("language", "karen");
      body.append("dialect", "sgaw");
      const response = await fetch("/api/audio/upload", { method: "POST", body });
      if (!response.ok) throw new Error("Upload failed");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  const text = {
    record: lang === "ksw" ? "စးထီၣ်ဖီၣ်ကလုၢ်" : "Start recording",
    stop: lang === "ksw" ? "ပတုာ်" : "Stop recording",
    upload: lang === "ksw" ? "ဆှၢလီၤကလုၢ်" : "Upload recording",
    ready: lang === "ksw" ? "ကွၢ်ကဒါနကလုၢ်" : "Review your recording"
  };

  return (
    <div className="recorder" aria-label="Karen audio recorder">
      <div className="recorder__visual" data-recording={status === "recording"} aria-hidden="true"><i /><i /><i /><i /><i /></div>
      <div>
        <strong>{status === "recording" ? text.stop : status === "ready" ? text.ready : text.record}</strong>
        <p>{lang === "ksw" ? "တဲဖျါထီၣ်ကညီကျိာ်တဖျၢၣ် မ့တမ့ၢ် တကျိာ်။" : "Record a Karen word or sentence in a quiet place."}</p>
      </div>
      {url ? <audio controls src={url}><track kind="captions" /></audio> : null}
      <div className="button-row">
        {status === "recording" ? <button className="button button--secondary" type="button" onClick={() => recorder.current?.stop()}>{text.stop}</button> : <button className="button button--secondary" type="button" onClick={start} disabled={status === "uploading"}>{text.record}</button>}
        {status === "ready" ? <button className="button button--primary" type="button" onClick={upload}>{text.upload}</button> : null}
      </div>
      <p className="form-status" aria-live="polite">{status === "uploading" ? messages.sending : status === "done" ? messages.success : status === "error" ? messages.error : ""}</p>
    </div>
  );
}
