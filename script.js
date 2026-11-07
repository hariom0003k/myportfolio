// ==========================================================================
// HARIOM DUBEY (root@hari) — RED-TEAM SWARM BOIDS ENGINE
// ==========================================================================

const canvas = document.getElementById("swarmCanvas");
const ctx = canvas.getContext("2d");

let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);

window.addEventListener("resize", () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

// Color Modes: 0 = Hybrid Crimson + Cyan, 1 = Pure Red-Team Alert
let colorMode = 0;
const modeBtn = document.getElementById("modeBtn");
if (modeBtn) {
  modeBtn.addEventListener("click", () => {
    colorMode = (colorMode + 1) % 2;
    modeBtn.textContent = colorMode === 0 ? "MODE: HYBRID_RED" : "MODE: PURE_CRIMSON";
  });
}

// Mouse & Touch Repulsion / Attraction State
const mouse = {
  x: null,
  y: null,
  radius: 170,
  active: false,
};

window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  mouse.active = true;
});

window.addEventListener("mouseleave", () => {
  mouse.active = false;
  mouse.x = null;
  mouse.y = null;
});

window.addEventListener("touchmove", (e) => {
  if (e.touches.length > 0) {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
    mouse.active = true;
  }
});

window.addEventListener("touchend", () => {
  mouse.active = false;
  mouse.x = null;
  mouse.y = null;
});

// Swarm Agent Class
class SwarmAgent {
  constructor(index) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 1.8;
    this.vy = (Math.random() - 0.5) * 1.8;
    this.radius = Math.random() * 1.6 + 1.1;
    // 78% Crimson Red-Team nodes, 22% Tactical Cyan nodes
    this.isCyan = index % 5 === 0;
    this.alpha = Math.random() * 0.55 + 0.35;
  }

  getColor(alphaOverride) {
    const a = alphaOverride !== undefined ? alphaOverride : this.alpha;
    if (colorMode === 0 && this.isCyan) {
      return `rgba(0, 240, 255, ${a})`;
    }
    return `rgba(255, 30, 66, ${a})`;
  }

  update() {
    // Wrap around screen edges smoothly
    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;

    // Interactive Cursor Repulsion Wave
    if (mouse.active && mouse.x !== null) {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.hypot(dx, dy);

      if (dist < mouse.radius && dist > 0) {
        const force = (mouse.radius - dist) / mouse.radius;
        const push = force * 1.9;
        this.vx += (dx / dist) * push;
        this.vy += (dy / dist) * push;
      }
    }

    // Speed clamp
    const speed = Math.hypot(this.vx, this.vy);
    const maxSpeed = 3.4;
    if (speed > maxSpeed) {
      this.vx = (this.vx / speed) * maxSpeed;
      this.vy = (this.vy / speed) * maxSpeed;
    }

    // Gentle friction & autonomous drift
    this.vx *= 0.988;
    this.vy *= 0.988;

    if (Math.abs(this.vx) < 0.25) this.vx += (Math.random() - 0.5) * 0.45;
    if (Math.abs(this.vy) < 0.25) this.vy += (Math.random() - 0.5) * 0.45;

    this.x += this.vx;
    this.y += this.vy;
  }

  draw() {
    ctx.fillStyle = this.getColor();
    ctx.shadowBlur = 10;
    ctx.shadowColor = (colorMode === 0 && this.isCyan) ? "#00f0ff" : "#ff1e42";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

// Adaptive particle density
const count = Math.min(Math.floor((width * height) / 9500), 135);
const swarm = Array.from({ length: count }, (_, i) => new SwarmAgent(i));

function drawSwarmMesh() {
  const maxDist = 115;
  for (let i = 0; i < swarm.length; i++) {
    for (let j = i + 1; j < swarm.length; j++) {
      const dx = swarm[i].x - swarm[j].x;
      const dy = swarm[i].y - swarm[j].y;
      const dist = Math.hypot(dx, dy);

      if (dist < maxDist) {
        const alpha = (1 - dist / maxDist) * 0.35;
        if (colorMode === 0 && (swarm[i].isCyan && swarm[j].isCyan)) {
          ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
        } else {
          ctx.strokeStyle = `rgba(255, 30, 66, ${alpha})`;
        }
        ctx.lineWidth = 0.65;
        ctx.beginPath();
        ctx.moveTo(swarm[i].x, swarm[i].y);
        ctx.lineTo(swarm[j].x, swarm[j].y);
        ctx.stroke();
      }
    }
  }

  // Draw tactical tether lines to cursor when nearby
  if (mouse.active && mouse.x !== null) {
    for (let i = 0; i < swarm.length; i++) {
      const dx = swarm[i].x - mouse.x;
      const dy = swarm[i].y - mouse.y;
      const dist = Math.hypot(dx, dy);
      if (dist < mouse.radius) {
        const alpha = (1 - dist / mouse.radius) * 0.45;
        ctx.strokeStyle = `rgba(255, 30, 66, ${alpha})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(swarm[i].x, swarm[i].y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    }
  }
}

function animateSwarm() {
  ctx.clearRect(0, 0, width, height);
  for (let i = 0; i < swarm.length; i++) {
    swarm[i].update();
    swarm[i].draw();
  }
  drawSwarmMesh();
  requestAnimationFrame(animateSwarm);
}

animateSwarm();
