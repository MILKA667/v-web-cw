import React, { useState, useRef } from "react";

interface AudioRecorderProps {
  onRecordingComplete: (file: File) => void;
  maxDuration?: number;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete, maxDuration = 10 }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        const audioFile = new File([blob], "recording.wav", { type: "audio/wav" });
        onRecordingComplete(audioFile);
      };

      mediaRecorder.start();
      setIsRecording(true);
      timerRef.current = window.setTimeout(stopRecording, maxDuration * 1000);
    } catch (err) {
      console.error("Ошибка доступа к микрофону:", err);
    }
  };

  const stopRecording = () => {
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div>
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? "Остановить запись" : "Записать аудио"}
      </button>
      {audioUrl && <audio controls src={audioUrl}></audio>}
    </div>
  );
};

export default AudioRecorder;
