import QRCode from "qrcode";

export async function showQRCode(data: string) {
  try {
    console.log("showQRCode called with data:", data);

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(data, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 300,
    });

    console.log("QR code generated successfully");

    // Create modal
    const modal = document.createElement("div");
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(0, 0, 0, 0.8);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      -webkit-tap-highlight-color: transparent;
    `;

    // Create modal content container
    const modalContent = document.createElement("div");
    modalContent.style.cssText = `
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      max-width: 90vw;
      max-height: 90vh;
      overflow: auto;
    `;

    // Create QR code image
    const img = document.createElement("img");
    img.src = qrCodeDataUrl;
    img.style.cssText = `
      border: 2px solid black;
      display: block;
      max-width: 100%;
      height: auto;
    `;

    // Create close button
    const closeButton = document.createElement("button");
    closeButton.textContent = "Close";
    closeButton.style.cssText = `
      margin-top: 20px;
      padding: 10px 20px;
      cursor: pointer;
      font-size: 16px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
    `;
    closeButton.onclick = () => {
      console.log("Close button clicked");
      modal.remove();
    };

    // Create title
    const title = document.createElement("h3");
    title.textContent = "Scan QR Code";
    title.style.cssText = `
      margin-top: 0;
      margin-bottom: 15px;
      color: #333;
    `;

    // Assemble modal
    modalContent.appendChild(title);
    modalContent.appendChild(img);
    modalContent.appendChild(closeButton);
    modal.appendChild(modalContent);

    // Close modal when clicking outside
    modal.onclick = (e) => {
      if (e.target === modal) {
        console.log("Modal background clicked");
        modal.remove();
      }
    };

    document.body.appendChild(modal);
    console.log("Modal appended to body");
  } catch (err) {
    console.error("Failed to generate QR code:", err);
    alert("Failed to generate QR code: " + err);
  }
}
