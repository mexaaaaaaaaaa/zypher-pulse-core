// [ZypherMC] Premium 3D depth background — rotating wireframe cubes + connected
// constellation particles with parallax. Pure canvas, no dependencies, 60fps.
(function(){
const canvas = document.createElement('canvas');
canvas.id = 'three-bg';
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');
let w, h, dpr = Math.min(devicePixelRatio||1, 2);
let particles = [], cubes = [], mouse = {x:0,y:0,tx:0,ty:0};
function resize(){
  w = innerWidth; h = innerHeight;
  canvas.width = w*dpr; canvas.height = h*dpr;
  canvas.style.width = w+'px'; canvas.style.height = h+'px';
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
resize(); addEventListener('resize', resize);
addEventListener('mousemove', e => { mouse.tx = e.clientX; mouse.ty = e.clientY; });
const COLORS = ['#9b35e8','#c84fff','#00d4ff','#ffd700'];

// Connected constellation particles (depth via z)
const COUNT = innerWidth < 700 ? 45 : 90;
for (let i=0; i<COUNT; i++) {
  particles.push({
    x: Math.random()*w, y: Math.random()*h,
    z: Math.random()*0.8+0.2,
    vx: (Math.random()-0.5)*0.25,
    vy: (Math.random()-0.5)*0.25,
    color: COLORS[Math.floor(Math.random()*COLORS.length)]
  });
}

// Floating 3D wireframe cubes
const CUBE_VERTS = [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]];
const CUBE_EDGES = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
for (let i=0; i<7; i++) {
  cubes.push({
    x: Math.random()*w, y: Math.random()*h,
    size: Math.random()*45+30,
    rx: Math.random()*Math.PI, ry: Math.random()*Math.PI,
    vrx: (Math.random()-0.5)*0.006, vry: (Math.random()-0.5)*0.006,
    vx: (Math.random()-0.5)*0.15, vy: (Math.random()-0.5)*0.15,
    depth: Math.random()*0.6+0.4,
    color: COLORS[Math.floor(Math.random()*COLORS.length)]
  });
}
function project(v, c){
  let [x,y,z] = v;
  let cy=Math.cos(c.ry), sy=Math.sin(c.ry);
  [x,z] = [x*cy - z*sy, x*sy + z*cy];
  let cx=Math.cos(c.rx), sx=Math.sin(c.rx);
  [y,z] = [y*cx - z*sx, y*sx + z*cx];
  const f = 3/(3+z);
  return [c.x + x*c.size*f, c.y + y*c.size*f];
}
function draw(){
  mouse.x += (mouse.tx - mouse.x)*0.05;
  mouse.y += (mouse.ty - mouse.y)*0.05;
  ctx.clearRect(0,0,w,h);
  const g = ctx.createRadialGradient(w/2,h*0.4,0,w/2,h/2,Math.max(w,h)/1.1);
  g.addColorStop(0,'rgba(155,53,232,0.10)');
  g.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0,0,w,h);

  particles.forEach(p => {
    p.x += p.vx + (mouse.x - w/2) * 0.00015 * p.z;
    p.y += p.vy + (mouse.y - h/2) * 0.00015 * p.z;
    if (p.x < -20) p.x = w+20; if (p.x > w+20) p.x = -20;
    if (p.y < -20) p.y = h+20; if (p.y > h+20) p.y = -20;
  });
  for (let i=0;i<particles.length;i++){
    for (let j=i+1;j<particles.length;j++){
      const a=particles[i], b=particles[j];
      const dx=a.x-b.x, dy=a.y-b.y, d=Math.hypot(dx,dy);
      if (d<130){
        ctx.globalAlpha = (1-d/130)*0.22*Math.min(a.z,b.z);
        ctx.strokeStyle = '#9b35e8'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
      }
    }
  }
  particles.forEach(p=>{
    ctx.globalAlpha = 0.6*p.z;
    ctx.fillStyle = p.color; ctx.shadowBlur = 8; ctx.shadowColor = p.color;
    ctx.beginPath(); ctx.arc(p.x,p.y,1.6+p.z*1.8,0,7); ctx.fill();
  });
  ctx.shadowBlur = 0;

  cubes.forEach(c=>{
    c.rx += c.vrx; c.ry += c.vry;
    c.x += c.vx + (mouse.x - w/2)*0.00008*c.depth;
    c.y += c.vy + (mouse.y - h/2)*0.00008*c.depth;
    if (c.x < -80) c.x = w+80; if (c.x > w+80) c.x = -80;
    if (c.y < -80) c.y = h+80; if (c.y > h+80) c.y = -80;
    const pts = CUBE_VERTS.map(v=>project(v,c));
    ctx.globalAlpha = 0.30*c.depth;
    ctx.strokeStyle = c.color; ctx.lineWidth = 1.2;
    ctx.shadowBlur = 12; ctx.shadowColor = c.color;
    ctx.beginPath();
    CUBE_EDGES.forEach(([a,b])=>{ ctx.moveTo(pts[a][0],pts[a][1]); ctx.lineTo(pts[b][0],pts[b][1]); });
    ctx.stroke();
  });
  ctx.shadowBlur = 0; ctx.globalAlpha = 1;
  requestAnimationFrame(draw);
}
draw();
console.log('[ZypherMC] 3D depth background initialized ✅');
})();
