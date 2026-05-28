// [ZypherMC] Lightweight purple particle/cube background (no three.js dep, pure canvas for speed)
(function(){
const canvas = document.createElement('canvas');
canvas.id = 'three-bg';
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');
let w, h, particles = [], mouse = {x:0,y:0};
function resize(){ w = canvas.width = innerWidth; h = canvas.height = innerHeight; }
resize(); addEventListener('resize', resize);
addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
const COLORS = ['#9b35e8','#c84fff','#00d4ff','#ffd700'];
for (let i=0; i<60; i++) {
  particles.push({
    x: Math.random()*w, y: Math.random()*h,
    z: Math.random()*1+0.3,
    size: Math.random()*14+6,
    vx: (Math.random()-0.5)*0.3,
    vy: (Math.random()-0.5)*0.3,
    rot: Math.random()*Math.PI*2,
    vr: (Math.random()-0.5)*0.01,
    color: COLORS[Math.floor(Math.random()*COLORS.length)]
  });
}
function draw(){
  ctx.clearRect(0,0,w,h);
  // purple fog
  const g = ctx.createRadialGradient(w/2,h/2,0,w/2,h/2,Math.max(w,h)/1.2);
  g.addColorStop(0,'rgba(155,53,232,0.08)');
  g.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0,0,w,h);
  particles.forEach(p => {
    p.x += p.vx + (mouse.x - w/2) * 0.0001 * p.z;
    p.y += p.vy + (mouse.y - h/2) * 0.0001 * p.z;
    p.rot += p.vr;
    if (p.x < -50) p.x = w+50; if (p.x > w+50) p.x = -50;
    if (p.y < -50) p.y = h+50; if (p.y > h+50) p.y = -50;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = 0.4 * p.z;
    ctx.fillStyle = p.color;
    ctx.shadowBlur = 20; ctx.shadowColor = p.color;
    ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
    ctx.restore();
  });
  requestAnimationFrame(draw);
}
draw();
console.log('[ZypherMC] 3D bg initialized');
})();
