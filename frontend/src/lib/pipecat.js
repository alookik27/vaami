import { PipecatClient } from "@pipecat-ai/client-js";
import { SmallWebRTCTransport } from "@pipecat-ai/small-webrtc-transport";
import {
  ProtobufFrameSerializer,
  WebSocketTransport,
} from "@pipecat-ai/websocket-transport";

export function isLocalPipecat(baseUrl) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(baseUrl);
}

export function publicWebSocketUrl(baseUrl) {
  return `${baseUrl.replace(/\/$/, "").replace(/^http/, "ws")}/ws-client`;
}

export function createPipecatClient({
  onUserTranscript,
  onBotTranscript,
  onError,
  useWebSocket,
}) {
  const transport = useWebSocket
    ? new WebSocketTransport({
        serializer: new ProtobufFrameSerializer(),
        recorderSampleRate: 16000,
        playerSampleRate: 24000,
      })
    : new SmallWebRTCTransport();

  const client = new PipecatClient({
    transport,
    enableMic: true,
    enableCam: false,

    callbacks: {
      onTransportStateChanged: (state) => {
        console.log("Transport:", state);
      },

      onConnected: () => {
        console.log("Pipecat connected");
      },

      onDisconnected: () => {
        console.log("Pipecat disconnected");
      },

      onUserTranscript: (data) => {
        if (data?.final && data?.text?.trim()) {
          onUserTranscript?.(data.text.trim());
        }
      },

      onBotTranscript: (data) => {
        if (data?.text?.trim()) {
          onBotTranscript?.(data.text.trim());
        }
      },

      onTrackStarted: (track, participant) => {
        if (useWebSocket || participant?.local || track.kind !== "audio") {
          return;
        }

        const audio = document.getElementById("bot-audio");

        if (!audio) {
          console.error("bot-audio element not found");
          return;
        }

        const stream = new MediaStream([track]);

        audio.srcObject = stream;
        audio.autoplay = true;
        audio.playsInline = true;

        audio.play().catch((error) => {
          console.error("Audio playback failed:", error);
        });
      },

      onError: (error) => {
        console.error("Pipecat error:", error);
        onError?.(error);
      },
    },
  });

  return client;
}
