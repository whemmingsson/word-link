export const showMessage = (
  text: string,
  type: "error" | "info" = "error",
  duration = 2000
) => {
  const messageDiv = document.createElement("div");
  messageDiv.textContent = text;
  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 15px 30px;
    background: ${type === "error" ? "#8d0303ff" : "#008600ff"};
    color: white;
    border-radius: 8px;
    font-size: 16px;
    z-index: 10000;
    font-weight: bold;
    font-family: Arial, sans-serif;
    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
  `;
  document.body.appendChild(messageDiv);

  setTimeout(() => {
    messageDiv.style.transition = "opacity 0.5s";
    messageDiv.style.opacity = "0";
    setTimeout(() => messageDiv.remove(), 500);
  }, duration);
};
