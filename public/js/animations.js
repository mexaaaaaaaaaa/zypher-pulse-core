// [ZypherMC] Count-up + reveal on scroll
(function(){
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    if (el.dataset.countup) {
      const end = +el.dataset.countup;
      const dur = 1500;
      const start = performance.now();
      const tick = t => {
        const p = Math.min(1, (t-start)/dur);
        el.textContent = fmtNum(end * (0.2 + 0.8*p*p));
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = fmtNum(end);
      };
      requestAnimationFrame(tick);
      io.unobserve(el);
    }
    if (el.classList.contains('reveal')) {
      el.classList.add('fade-up');
      io.unobserve(el);
    }
  });
}, {threshold:0.15});
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-countup],.reveal').forEach(el => io.observe(el));
});
// Konami code
let buf = [];
const code = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
addEventListener('keydown', e => {
  buf.push(e.key); if (buf.length > code.length) buf.shift();
  if (code.every((k,i)=>k===buf[i])) {
    document.body.style.transition='filter 1s'; document.body.style.filter='hue-rotate(120deg)';
    showToast('🐉 DRAGON UNLEASHED','success');
    setTimeout(()=>document.body.style.filter='',2000); buf=[];
  }
});
