import { useEffect } from "react";

export const JoinHandler = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // Check if there's an offer parameter (joining a game)
    const offerBase64 = params.get("offer");
    if (offerBase64) {
      handleJoinGame(offerBase64);
    }

    // Check if there's an answer parameter (host receiving answer)
    const answerBase64 = params.get("answer");
    if (answerBase64) {
      handleReceiveAnswer(answerBase64);
    }
  }, []);

  const handleJoinGame = async (offerBase64: string) => {
    try {
      const offerJson = atob(offerBase64);
      console.log("Joining game with offer:", offerJson);

      const { joinGame } = await import("../webrtc/webrtc-join");
      await joinGame(offerJson);

      alert(
        "Joined game! Scan the QR code that appears to complete connection."
      );
    } catch (error) {
      console.error("Failed to join game:", error);
      alert("Failed to join game. Invalid QR code.");
    }
  };

  const handleReceiveAnswer = async (answerBase64: string) => {
    try {
      const answerJson = atob(answerBase64);
      const answer = JSON.parse(answerJson);
      console.log("Received answer:", answer);

      // You'll need to export the pc from webrtc-host to complete the connection
      alert("Answer received! Connection should be established.");
      // TODO: Import pc from host and call pc.setRemoteDescription(answer)
    } catch (error) {
      console.error("Failed to process answer:", error);
      alert("Failed to process answer. Invalid QR code.");
    }
  };

  return null;
};
