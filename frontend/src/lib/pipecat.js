import { PipecatClient } from "@pipecat-ai/client-js";
import { SmallWebRTCTransport } from "@pipecat-ai/small-webrtc-transport";

export function createPipecatClient({
  onUserTranscript,
  onBotTranscript,
}) {
  const transport = new SmallWebRTCTransport();

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
        console.log("Track started:", track?.kind, participant);

        if (participant?.local || track.kind !== "audio") {
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

        audio.play()
          .then(() => {
            console.log("AI audio playback started");
          })
          .catch((error) => {
            console.error("Audio playback failed:", error);
          });
      },

      onTrackStopped: (track) => {
        console.log("Track stopped:", track?.kind);
      },

      onError: (error) => {
        console.error("Pipecat error:", error);
      },
    },
  });

  return client;
}