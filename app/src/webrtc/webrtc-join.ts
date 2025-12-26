import { showQRCode } from "../utils/qrCodeUtils";

const pc = new RTCPeerConnection({
  iceServers: [],
});

pc.ondatachannel = (event) => {
  const channel = event.channel;

  channel.onopen = () => {
    console.log("Connected to host");
  };

  channel.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    console.log("Received", msg);
  };
};

async function joinGame(offerJson: string) {
  const offer = JSON.parse(offerJson);

  await pc.setRemoteDescription(offer);

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  pc.onicecandidate = () => {
    if (pc.iceGatheringState === "complete") {
      const answer = pc.localDescription!;
      // Encode answer as base64
      const answerBase64 = btoa(JSON.stringify(answer));
      // Create URL for host to scan
      const answerUrl = `${window.location.origin}/answer?answer=${answerBase64}`;
      console.log("Answer URL:", answerUrl);
      showQRCode(answerUrl);
    }
  };
}

// Export function to be called from URL parameters
export { joinGame };
