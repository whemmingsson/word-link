// webrtc-host.ts
import { showQRCode } from "../utils/qrCodeUtils";

const pc = new RTCPeerConnection({
  iceServers: [], // offline / local only
});

const channel = pc.createDataChannel("game");

channel.onopen = () => {
  console.log("DataChannel open");
};

channel.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  console.log("Received", msg);
};

// ICE candidates (samla dem i SDP)
pc.onicecandidate = () => {
  console.log("ICE candidate event:", pc.iceGatheringState);
  if (pc.iceGatheringState === "complete") {
    const offer = pc.localDescription!;
    // Encode offer as base64 to make it URL-safe
    const offerBase64 = btoa(JSON.stringify(offer));
    // Create URL that points to your app with the offer as a parameter
    const joinUrl = `${window.location.origin}/join?offer=${offerBase64}`;
    console.log("Join URL:", joinUrl);
    showQRCode(joinUrl);
  }
};

export async function createGame() {
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
}
