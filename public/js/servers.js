// [ZypherMC] Servers dashboard renderer (live, 15s refresh)
const SERVER_LIST = [
  {key:'pvp',label:'PvP Practice',icon:'⚔️',isPvP:true},
  {key:'lobby',label:'Lobby',icon:'🏛️'},
  {key:'bedwars',label:'BedWars',icon:'🛏️'},
  {key:'lifesteal',label:'Lifesteal',icon:'❤️'},
  {key:'survival',label:'Survival',icon:'🌲'},
  {key:'minigames',label:'Minigames',icon:'🎮'},
  {key:'velocity',label:'Proxy',icon:'🌐'}
];
function tpsClass(tps){ if(tps==null) return ''; if(tps>=18) return 'tps-good'; if(tps>=15) return 'tps-mid'; return 'tps-bad'; }
function pct(a,b){ return b ? Math.min(100,(a/b)*100) : 0; }
function renderServerCard(srv, s, players) {
  if (!s || !s.online) {
    return `<div class="server-card offline tilt" data-key="${srv.key}">
      <div class="sc-head"><div class="sc-name">${srv.icon} ${srv.label}</div><span class="tag red">Offline</span></div>
      <div class="empty">Server offline</div>
    </div>`;
  }
  const online = s.playerCount||0, max = s.maxPlayers||100;
  // Online players live under /servers/{key}/players (not inside status).
  const onlineNames = objToArr(players).filter(p=>p.online).map(p=>p._key).slice(0,30);
  return `<div class="server-card tilt" data-key="${srv.key}">
    <div class="sc-head">
      <div class="sc-name"><span class="status-dot online"></span>${srv.icon} ${srv.label}</div>
      <span class="tag green">Online</span>
    </div>
    <div class="sc-row"><span class="l">Players</span><span class="v">${online} / ${max}</span></div>
    <div class="bar"><div style="width:${pct(online,max)}%"></div></div>
    <div class="sc-row"><span class="l">Type</span><span class="v">${s.isPvP?'PvP':s.isLobby?'Lobby':'Game'}</span></div>
    ${onlineNames.length?`<div style="margin-top:.75rem"><div class="sc-row"><span class="l">Online players</span><span class="v">${online}</span></div>
      <div class="players-list">${onlineNames.map(p=>`<a href="/player.html?name=${encodeURIComponent(p)}"><img src="${avatarUrl(p)}" alt=""/>${p}</a>`).join('')}</div></div>`:''}
    <div class="sc-updated">Updated ${fmtTimeAgo(s.lastUpdated)}</div>
    ${srv.isPvP?`<div style="margin-top:1rem"><a href="/leaderboard.html" class="btn btn-ghost" style="width:100%;justify-content:center">View Tiers →</a></div>`:''}
  </div>`;
}
async function loadServers(targetId) {
  const target = document.getElementById(targetId);
  if (!target) return;
  const all = await db('/servers');
  if (!all) { target.innerHTML = '<div class="empty">No servers reporting yet</div>'; return; }
  target.innerHTML = SERVER_LIST.map(s => renderServerCard(s, all[s.key]?.status, all[s.key]?.players)).join('');
}
function initServersPage() {
  loadServers('server-grid');
  setInterval(()=>loadServers('server-grid'), 15000);
}
