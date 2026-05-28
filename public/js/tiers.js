// [ZypherMC] Tiers showcase
const TIERS = [
  {name:'Bronze',min:0,max:1099,color:'#cd7f32',icon:'🥉'},
  {name:'Silver',min:1100,max:1299,color:'#c0c0c0',icon:'🥈'},
  {name:'Gold',min:1300,max:1499,color:'#ffd700',icon:'🥇'},
  {name:'Diamond',min:1500,max:1699,color:'#00d4ff',icon:'💎'},
  {name:'Master',min:1700,max:1899,color:'#9b35e8',icon:'👑'},
  {name:'Legend',min:1900,max:9999,color:'rainbow',icon:'🐉'}
];
async function loadTiers() {
  const root = document.getElementById('tiers-root');
  if (!root) return;
  root.innerHTML = skeleton(6);
  const lb = await db('/pvp/leaderboard/overall');
  const arr = Array.isArray(lb)?lb.filter(Boolean):objToArr(lb);
  const counts = TIERS.map(t => arr.filter(p=>p.elo>=t.min && p.elo<=t.max));
  root.innerHTML = `
    <div class="tier-progress"><div></div></div>
    <div class="tier-showcase">${TIERS.map((t,i)=>{
      const style = t.color==='rainbow'?'background:linear-gradient(90deg,#ff0080,#9b35e8,#00d4ff,#00ff88,#ffd700);background-size:300% 100%;animation:rainbow 3s linear infinite;-webkit-background-clip:text;background-clip:text;color:transparent':`color:${t.color}`;
      return `<div class="tier-card tilt" style="border-color:${t.color==='rainbow'?'#9b35e8':t.color}66;box-shadow:0 0 30px ${t.color==='rainbow'?'#9b35e8':t.color}33">
        <div style="font-size:2.5rem">${t.icon}</div>
        <div class="tname" style="${style}">${t.name}</div>
        <div class="trange">${t.min} – ${t.max===9999?'∞':t.max} ELO</div>
        <div class="tcount" style="${style}">${counts[i].length}</div>
        <div class="trange">players</div>
      </div>`;
    }).join('')}</div>
    <section class="reveal"><h2 class="section-title">Where do you rank?</h2>
      <div class="flex" style="max-width:500px"><input id="tier-search" placeholder="Enter your Minecraft name"/><button class="btn btn-primary" onclick="checkMyTier()">Check</button></div>
      <div id="tier-result" style="margin-top:1rem"></div></section>
    <section class="reveal"><h2 class="section-title">Top players per tier</h2>
      <div class="grid grid-2">${TIERS.map((t,i)=>`
        <div class="card"><h3 style="color:${t.color==='rainbow'?'#c84fff':t.color}">${t.icon} ${t.name}</h3>
        ${counts[i].slice(0,5).map((p,j)=>`<div class="sc-row"><span><strong>#${j+1}</strong> <a href="/player.html?name=${encodeURIComponent(p.playerName)}">${p.playerName}</a></span><span class="v">${fmtNum(p.elo)}</span></div>`).join('') || '<div class="empty" style="padding:1rem">No players yet</div>'}
        </div>`).join('')}</div></section>`;
}
async function checkMyTier() {
  const name = document.getElementById('tier-search').value.trim();
  if (!name) return;
  const el = document.getElementById('tier-result');
  el.innerHTML = '<div class="skeleton" style="height:80px"></div>';
  const elo = (await db(`/pvp/players/${name}/elo/overall/currentElo`)) ?? 0;
  if (!elo) { el.innerHTML='<div class="empty">Player not found</div>'; return; }
  const t = tierFromElo(elo);
  el.innerHTML = `<div class="card"><strong>${name}</strong> — ${tierBadge(elo)} with <strong>${fmtNum(elo)}</strong> ELO. <a href="/player.html?name=${encodeURIComponent(name)}">View profile →</a></div>`;
}
