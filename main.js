const canvas = document.getElementById("drawCanvas");
const ctx = canvas.getContext("2d");
const gazeCursor = document.getElementById("gazeCursor");
const colorPicker = document.getElementById("colorPicker");
const clearBtn = document.getElementById("clear");

let currentTool = "draw";
let isDrawing = false;
let lastX = 0, lastY = 0;
let brushColor = "#000";

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

webgazer.setGazeListener((data, timestamp) => {
  if (!data) return;

  const x = data.x;
  const y = data.y;

  gazeCursor.style.left = x - 7.5 + "px";
  gazeCursor.style.top = y - 7.5 + "px";

  if (currentTool === "draw") {
    if (!isDrawing) {
      lastX = x;
      lastY = y;
      isDrawing = true;
      setTimeout(() => isDrawing = false, 100);
    } else {
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();
      lastX = x;
      lastY = y;
    }
  } else if (currentTool === "erase") {
    ctx.clearRect(x - 10, y - 10, 20, 20);
  }
}).begin();