import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPipecatClient } from "../lib/pipecat";
import { saveCall } from "../lib/api.js";
const PLACEHOLDER_PIPECAT_URL = "https://your-pipecat-server.com";

function pipecatBaseUrl() {
  const value = (import.meta.env.VITE_PIPECAT_URL || "")
    .trim()
    .replace(/\/$/, "");

  if (!value || value === PLACEHOLDER_PIPECAT_URL) {
    throw new Error(
      "Set VITE_PIPECAT_URL to your Pipecat HTTPS origin, then rebuild the frontend.",
    );
  }

  return value;
}

function errorMessage(error, fallback) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function CallPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("ready");
  const [pipecat, setPipecat] = useState(null);
  const [transcript, setTranscript] = useState([]);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState("");
  const audioRef = useRef(null);
  const startTimeRef = useRef(null);
  const timerRef = useRef(null);
  const transcriptRef = useRef([]);
  const pipecatRef = useRef(null);
  const pendingCallIdRef = useRef(null);
  const endTimeRef = useRef(null);
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      const client = pipecatRef.current;
      pipecatRef.current = null;
      if (client) {
        client.disconnect().catch((disconnectError) => {
          console.error(disconnectError);
        });
      }
    };
  }, []);
  function addTranscript(speaker, text) {
    const message = { speaker, text, timestamp: new Date().toISOString() };
    transcriptRef.current.push(message);
    setTranscript((previous) => [...previous, message]);
  }
  async function releaseClient() {
    const client = pipecatRef.current;
    pipecatRef.current = null;
    setPipecat(null);
    if (!client) return;
    try {
      await client.disconnect();
    } catch (disconnectError) {
      console.error(disconnectError);
    }
  }
  async function startCall() {
    setError("");
    try {
      const baseUrl = pipecatBaseUrl();
      setStatus("connecting");
      setTranscript([]);
      transcriptRef.current = [];
      pendingCallIdRef.current = null;
      endTimeRef.current = null;
      setDuration(0);
      startTimeRef.current = new Date();
      const client = createPipecatClient({
        onUserTranscript: (text) => {
          addTranscript("user", text);
        },
        onBotTranscript: (text) => {
          addTranscript("assistant", text);
        },
      });
      pipecatRef.current = client;
      await client.initDevices();
      await client.startBotAndConnect({
        endpoint: `${baseUrl}/start`,
      });
      setPipecat(client);
      setStatus("connected");
      timerRef.current = setInterval(() => {
        if (!startTimeRef.current) return;
        const elapsed = Math.floor(
          (Date.now() - startTimeRef.current.getTime()) / 1000,
        );
        setDuration(elapsed);
      }, 1000);
    } catch (startError) {
      console.error(startError);
      setError(errorMessage(startError, "Could not start the call."));
      setStatus("ready");
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      await releaseClient();
    }
  }
  async function endCall() {
    setError("");
    if (!endTimeRef.current) {
      endTimeRef.current = new Date();
    }
    const endTime = endTimeRef.current;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    let finalDuration = duration;
    if (startTimeRef.current) {
      finalDuration = Math.floor(
        (endTime.getTime() - startTimeRef.current.getTime()) / 1000,
      );
    }
    if (!pendingCallIdRef.current) {
      pendingCallIdRef.current = `call-${Date.now()}`;
    }
    const callId = pendingCallIdRef.current;
    try {
      await releaseClient();
      await saveCall({
        id: callId,
        startTime: startTimeRef.current
          ? startTimeRef.current.toISOString()
          : endTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: finalDuration,
        transcript: transcriptRef.current,
        metrics: {},
      });
      pendingCallIdRef.current = null;
      endTimeRef.current = null;
      setStatus("ended");
      setTimeout(() => {
        navigate(`/calls/${callId}`);
      }, 500);
    } catch (saveError) {
      console.error(saveError);
      setError(errorMessage(saveError, "Could not save the call."));
      setStatus("save_failed");
    }
  }
  function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  }
  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 flex flex-col items-center justify-center selection:bg-white selection:text-black">
      {" "}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {" "}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[140px]" />{" "}
      </div>{" "}
      <div className="relative z-10 w-full max-w-6xl space-y-6">
        {" "}
        <div className="text-center md:text-left space-y-1 px-1">
          {" "}
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            {" "}
            Vaami Voice Assistant{" "}
          </h1>{" "}
          <p className="text-zinc-400 text-sm font-medium tracking-wide">
            {" "}
            Real-time AI voice conversation{" "}
          </p>{" "}
        </div>{" "}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {" "}
          <div className="lg:col-span-5 rounded-3xl border border-white/10 bg-zinc-900/60 p-8 shadow-2xl backdrop-blur-2xl flex flex-col justify-between min-h-[480px]">
            {" "}
            <div className="text-center my-auto py-8 space-y-6">
              {" "}
              {status === "ready" && (
                <div className="space-y-3">
                  {" "}
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-800 bg-zinc-950/50 text-zinc-400 text-sm font-medium">
                    {" "}
                    <span className="w-2 h-2 rounded-full bg-zinc-500 animate-pulse" />{" "}
                    Ready to start{" "}
                  </div>{" "}
                  <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                    {" "}
                    Click the start button below to initialize audio and begin
                    talking.{" "}
                  </p>{" "}
                </div>
              )}{" "}
              {status === "connecting" && (
                <div className="space-y-3">
                  {" "}
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-white/5 text-zinc-200 text-sm font-medium">
                    {" "}
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />{" "}
                    Connecting...{" "}
                  </div>{" "}
                  <p className="text-xs text-zinc-500">
                    {" "}
                    Establishing WebRTC connection...{" "}
                  </p>{" "}
                </div>
              )}{" "}
              {status === "connected" && (
                <div className="space-y-4">
                  {" "}
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-white/10 text-white text-sm font-semibold tracking-wide shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                    {" "}
                    <span className="relative flex h-2.5 w-2.5">
                      {" "}
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />{" "}
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />{" "}
                    </span>{" "}
                    Connected{" "}
                  </div>{" "}
                  <p className="text-6xl font-mono font-extrabold tracking-wider text-white drop-shadow-md">
                    {" "}
                    {formatDuration(duration)}{" "}
                  </p>{" "}
                </div>
              )}{" "}
              {status === "ended" && (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-800 bg-zinc-950/50 text-zinc-500 text-sm font-medium">
                  {" "}
                  Call ended{" "}
                </div>
              )}{" "}
              {status === "save_failed" && (
                <div className="space-y-3">
                  {" "}
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-500/30 bg-red-950/40 text-red-200 text-sm font-medium">
                    {" "}
                    Call ended, save failed{" "}
                  </div>{" "}
                  <p className="text-xs text-zinc-500">
                    {" "}
                    The voice session is closed. Retry to store this transcript.{" "}
                  </p>{" "}
                </div>
              )}{" "}
            </div>{" "}
            <audio
              id="bot-audio"
              ref={audioRef}
              autoPlay
              playsInline
              className="hidden"
            />{" "}
            <div className="pt-4 border-t border-white/5 space-y-3">
              {" "}
              {error && (
                <p className="rounded-2xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-100">
                  {error}
                </p>
              )}{" "}
              {(status === "ready" || status === "connecting" || status === "ended") && (
                <button
                  onClick={startCall}
                  disabled={status === "connecting"}
                  className="w-full rounded-2xl bg-white py-4 font-semibold text-black transition-all duration-200 hover:bg-zinc-200 active:scale-[0.99] disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed shadow-[0_0_25px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2"
                >
                  {" "}
                  {status === "connecting" ? (
                    <span>Connecting...</span>
                  ) : (
                    <span>Start Call</span>
                  )}{" "}
                </button>
              )}{" "}
              {status === "save_failed" && (
                <button
                  onClick={endCall}
                  className="w-full rounded-2xl bg-white py-4 font-semibold text-black transition-all duration-200 hover:bg-zinc-200 active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  {" "}
                  <span>Retry save</span>{" "}
                </button>
              )}{" "}
              {status === "connected" && (
                <button
                  onClick={endCall}
                  className="w-full rounded-2xl border border-red-500/30 bg-red-950/40 py-4 font-semibold text-red-200 transition-all duration-200 hover:bg-red-900/60 hover:border-red-500/50 active:scale-[0.99] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.15)]"
                >
                  {" "}
                  <span>End Call</span>{" "}
                </button>
              )}{" "}
            </div>{" "}
          </div>{" "}
          <div className="lg:col-span-7 space-y-6">
            {" "}
            <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 shadow-2xl backdrop-blur-2xl">
              {" "}
              <div className="flex items-center justify-between mb-4 px-1">
                {" "}
                <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                  {" "}
                  Live Transcript{" "}
                </h2>{" "}
                {transcript.length > 0 && (
                  <span className="text-xs text-zinc-500 font-mono">
                    {" "}
                    {transcript.length} message{" "}
                    {transcript.length > 1 ? "s" : ""}{" "}
                  </span>
                )}{" "}
              </div>{" "}
              <div className="h-[320px] overflow-y-auto space-y-4 rounded-2xl border border-white/5 bg-zinc-950/70 p-5 backdrop-blur-md scrollbar-thin scrollbar-thumb-zinc-800">
                {" "}
                {transcript.length === 0 && (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    {" "}
                    <div className="w-10 h-10 mb-3 rounded-full border border-zinc-800 bg-zinc-900/50 flex items-center justify-center text-zinc-600 text-sm" />{" "}
                    <p className="text-sm text-zinc-500 font-medium">
                      {" "}
                      Conversation will appear here once connected...{" "}
                    </p>{" "}
                  </div>
                )}{" "}
                {transcript.map((message, index) => (
                  <div
                    key={`${message.timestamp}-${index}`}
                    className={`flex ${message.speaker === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {" "}
                    <div
                      className={`max-w-[80%] rounded-2xl px-5 py-3 transition-all ${message.speaker === "user" ? "bg-white text-black font-medium shadow-[0_4px_20px_rgba(255,255,255,0.08)]" : "bg-zinc-900 border border-white/10 text-zinc-100 shadow-sm"}`}
                    >
                      {" "}
                      <p
                        className={`mb-1 text-[10px] font-bold tracking-wider uppercase ${message.speaker === "user" ? "text-zinc-600" : "text-zinc-400"}`}
                      >
                        {" "}
                        {message.speaker === "user" ? "You" : "Vaami"}{" "}
                      </p>{" "}
                      <p className="text-sm leading-relaxed">
                        {" "}
                        {message.text}{" "}
                      </p>{" "}
                    </div>{" "}
                  </div>
                ))}{" "}
              </div>{" "}
            </div>{" "}
            <div className="rounded-2xl border border-white/5 bg-zinc-950/40 p-4 text-xs font-mono text-zinc-400">
              {" "}
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-zinc-800/60">
                {" "}
                <span className="font-semibold text-zinc-300 uppercase tracking-wider text-[10px]">
                  {" "}
                  System Status{" "}
                </span>{" "}
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />{" "}
              </div>{" "}
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                {" "}
                <div className="bg-zinc-900/50 p-2 rounded-lg border border-zinc-800/40">
                  {" "}
                  <span className="block text-[10px] text-zinc-500 uppercase">
                    {" "}
                    Status{" "}
                  </span>{" "}
                  <span className="text-zinc-200 font-bold">
                    {" "}
                    {status}{" "}
                  </span>{" "}
                </div>{" "}
                <div className="bg-zinc-900/50 p-2 rounded-lg border border-zinc-800/40">
                  {" "}
                  <span className="block text-[10px] text-zinc-500 uppercase">
                    {" "}
                    Pipecat{" "}
                  </span>{" "}
                  <span
                    className={
                      pipecat ? "text-emerald-400 font-bold" : "text-zinc-500"
                    }
                  >
                    {" "}
                    {pipecat ? "connected" : "idle"}{" "}
                  </span>{" "}
                </div>{" "}
                <div className="bg-zinc-900/50 p-2 rounded-lg border border-zinc-800/40">
                  {" "}
                  <span className="block text-[10px] text-zinc-500 uppercase">
                    {" "}
                    Messages{" "}
                  </span>{" "}
                  <span className="text-zinc-200 font-bold">
                    {" "}
                    {transcript.length}{" "}
                  </span>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
export default CallPage;
