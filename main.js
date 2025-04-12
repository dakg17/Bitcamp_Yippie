const canvas = document.getElementById("drawCanvas");
const ctx = canvas.getContext("2d");
const gazeCursor = document.getElementById("gazeCursor");
const colorPicker = document.getElementById("colorPicker");
const clearBtn = document.getElementById("clear");

let currentTool = "draw";
let isDrawing = false;
let lastX = 0, lastY = 0;
let brushColor = "#000";
let isCalibrated = false;

let smoothedX = window.innerWidth / 2;
let smoothedY = window.innerHeight / 2;

const smoothingFactor = 0.15; // smaller = smoother/slower
const drawCooldown = 120; // ms between strokes
let lastDrawTime = Date.now();

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

colorPicker.addEventListener("change", (e) => brushColor = e.target.value);
document.querySelectorAll("[data-tool]").forEach(btn => {
  btn.addEventListener("click", () => currentTool = btn.dataset.tool);
});
clearBtn.addEventListener("click", () => ctx.clearRect(0, 0, canvas.width, canvas.height));

// Calibration
const calibrationDiv = document.getElementById("calibration");
const dotsDiv = document.getElementById("dots");

const dotPositions = [
  [10, 10], [50, 10], [90, 10],
  [10, 50], [50, 50], [90, 50],
  [10, 90], [50, 90], [90, 90],
];
let clicks = 0;

dotPositions.forEach(([x, y]) => {
  const dot = document.createElement("div");
  dot.className = "dot";
  dot.style.left = `${x}vw`;
  dot.style.top = `${y}vh`;
  dot.onclick = () => {
    webgazer.recordScreenPosition(
      x * window.innerWidth / 100,
      y * window.innerHeight / 100,
      'click'
    );
    dot.remove();
    clicks++;
    if (clicks === dotPositions.length) {
      calibrationDiv.style.display = "none";
      isCalibrated = true;
    }
  };
  dotsDiv.appendChild(dot);
});

webgazer.setGazeListener((data) => {
  if (!data || !isCalibrated) return;

  const targetX = data.x;
  const targetY = data.y;

  // Smooth the motion
  smoothedX += (targetX - smoothedX) * smoothingFactor;
  smoothedY += (targetY - smoothedY) * smoothingFactor;

  gazeCursor.style.left = (smoothedX - 10) + "px";
  gazeCursor.style.top = (smoothedY - 10) + "px";

  const now = Date.now();

  if (currentTool === "draw") {
    if (now - lastDrawTime > drawCooldown) {
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(smoothedX, smoothedY);
      ctx.stroke();
      lastX = smoothedX;
      lastY = smoothedY;
      lastDrawTime = now;
    }
  } else if (currentTool === "erase") {
    ctx.clearRect(smoothedX - 10, smoothedY - 10, 20, 20);
  }
}).begin();

webgazer.showVideoPreview(true);
webgazer.showPredictionPoints(false);
webgazer.showFaceOverlay(true);