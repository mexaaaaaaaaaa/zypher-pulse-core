// [ZypherMC] Purple particle burst (used by Copy IP button)
function purpleBurst(x, y) {
  for (let i=0; i<24; i++) {
    const p = document.createElement('div');
    const angle = (i / 24) * Math.PI * 2;
    const dist = 60 + Math.random()*40;
    p.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:8px;height:8px;border-radius:50%;background:hsl(${270+Math.random()*40},80%,${50+Math.random()*30}%);box-shadow:0 0 10px currentColor;pointer-events:none;z-index:9999;transition:transform .8s cubic-bezier(.2,.8,.2,1),opacity .8s`;
    document.body.appendChild(p);
    requestAnimationFrame(() => {
      p.style.transform = `translate(${Math.cos(angle)*dist}px,${Math.sin(angle)*dist}px) scale(0)`;
      p.style.opacity = '0';
    });
    setTimeout(() => p.remove(), 850);
  }
}
