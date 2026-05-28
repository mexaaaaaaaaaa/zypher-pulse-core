// [ZypherMC] Navbar — inject shared navbar + scroll behavior + live player count
(function(){
const path = location.pathname.replace(/\/$/,'') || '/index.html';
const isActive = p => path.endsWith(p) ? 'active' : '';
const html = `
<nav class="navbar" id="navbar">
  <div class="nav-inner">
    <a href="/index.html" class="nav-logo">
      <img src="/assets/logo.png" alt="ZypherMC"/>
      <span>ZypherMC</span>
    </a>
    <div class="nav-links">
      <a href="/index.html" class="${isActive('/index.html')}">Home</a>
      <a href="/servers.html" class="${isActive('/servers.html')}">Servers</a>
      <a href="/leaderboard.html" class="${isActive('/leaderboard.html')}">Leaderboard</a>
      <a href="/matches.html" class="${isActive('/matches.html')}">Matches</a>
      <a href="/tiers.html" class="${isActive('/tiers.html')}">Tiers</a>
      <a href="/spectate.html" class="${isActive('/spectate.html')}">Spectate</a>
      <a href="/stats.html" class="${isActive('/stats.html')}">Stats</a>
      <a href="/about.html" class="${isActive('/about.html')}">About</a>
    </div>
    <div class="nav-right">
      <span class="nav-players" id="nav-players">● — online</span>
      <a href="https://discord.gg/zypertiers" target="_blank" rel="noopener" class="btn btn-discord hide-mobile">Discord</a>
      <a href="/login.html" id="nav-auth" class="btn btn-ghost hide-mobile">Login</a>
      <button class="nav-toggle" id="nav-toggle" aria-label="Menu">☰</button>
    </div>
  </div>
  <div class="nav-drawer" id="nav-drawer">
    <a href="/index.html">Home</a>
    <a href="/servers.html">Servers</a>
    <a href="/leaderboard.html">Leaderboard</a>
    <a href="/matches.html">Matches</a>
    <a href="/tiers.html">Tiers</a>
    <a href="/spectate.html">Spectate</a>
    <a href="/stats.html">Stats</a>
    <a href="/about.html">About</a>
    <a href="https://discord.gg/zypertiers" target="_blank" rel="noopener">Discord</a>
    <a href="/login.html" id="nav-auth-mobile">Login</a>
  </div>
</nav>
<div class="scroll-progress" id="scroll-progress"></div>
<div id="toast-container"></div>
`;
document.body.insertAdjacentHTML('afterbegin', html);

// Scroll progress + hide on down/show on up
let lastY = 0;
const nav = document.getElementById('navbar');
const sp = document.getElementById('scroll-progress');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  const h = document.documentElement.scrollHeight - window.innerHeight;
  sp.style.width = (h>0 ? (y/h)*100 : 0) + '%';
  if (y > 100 && y > lastY) nav.classList.add('hidden');
  else nav.classList.remove('hidden');
  lastY = y;
});

// Drawer
document.getElementById('nav-toggle').addEventListener('click', () => {
  document.getElementById('nav-drawer').classList.toggle('open');
});

// Auth state
const email = localStorage.getItem('zyper_email');
if (email) {
  const short = email.split('@')[0];
  const a = document.getElementById('nav-auth');
  if (a){ a.textContent = short; a.href = 'javascript:firebaseLogout()'; }
  const a2 = document.getElementById('nav-auth-mobile');
  if (a2){ a2.textContent = 'Logout ('+short+')'; a2.href = 'javascript:firebaseLogout()'; }
}

// Live player count
async function refreshPlayers(){
  try {
    const net = await db('/network/status');
    const el = document.getElementById('nav-players');
    if (net && typeof net.totalPlayers === 'number') {
      el.textContent = '● ' + fmtNum(net.totalPlayers) + ' online';
    } else {
      el.textContent = '● offline';
      el.style.color = 'var(--text-secondary)';
    }
  } catch(e){ console.warn('[ZypherMC] nav players', e); }
}
refreshPlayers();
setInterval(refreshPlayers, 30000);
})();
