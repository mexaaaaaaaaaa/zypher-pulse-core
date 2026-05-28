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
function renderServerCard(srv, s) {
  if (!s || !s.online) {
    return `<div class="server-card offline tilt" data-key="${srv.key}">
      <div class="sc-head"><div class="sc-name">${srv.icon} ${srv.label}</div><span class="tag red">Offline</span></div>
      <div class="empty">Server offline</div>
    </div>`;
  }
  const online = s.playerCount||0, max = s.maxPlayers||100;
  const memUsed = s.memoryUsed||0, memMax = s.memoryMax||1;
  const cpu = s.cpuLoad||0;
  const players = (s.onlinePlayers||[]).slice(0,30);
  return `<div class="server-card tilt" data-key="${srv.key}">
    <div class="sc-head">
      <div class="sc-name"><span class="status-dot online"></span>${srv.icon} ${srv.label}</div>
      <span class="tag green">Online</span>
    </div>
    <div class="sc-row"><span class="l">Players</span><span class="v">${online} / ${max}</span></div>
    <div class="bar"><div style="width:${pct(online,max)}%"></div></div>
    <div class="sc-row"><span class="l">TPS</span><span class="v ${tpsClass(s.tps)}">${s.tps?.toFixed?.(1)??'—'}</span></div>
    <div class="sc-row"><span class="l">MSPT</span><span class="v">${s.mspt?.toFixed?.(1)??'—'} ms</span></div>
    <div class="sc-row"><span class="l">Memory</span><span class="v">${fmtNum(memUsed)} / ${fmtNum(memMax)} MB</span></div>
    <div class="bar ${pct(memUsed,memMax)>80?'red':pct(memUsed,memMax)>60?'yellow':'green'}"><div style="width:${pct(memUsed,memMax)}%"></div></div>
    <div class="sc-row"><span class="l">CPU</span><span class="v">${cpu.toFixed?.(1)??cpu}%</span></div>
    <div class="bar ${cpu>80?'red':cpu>50?'yellow':'green'}"><div style="width:${Math.min(100,cpu)}%"></div></div>
    <div class="sc-row"><span class="l">Uptime</span><span class="v">${fmtDuration(s.uptime)}</span></div>
    <div class="sc-row"><span class="l">Version</span><span class="v">${s.serverVersion||'—'}</span></div>
    ${s.diskUsed?`<div class="sc-row"><span class="l">Disk</span><span class="v">${fmtNum(s.diskUsed)} / ${fmtNum(s.diskMax||0)} MB</span></div>`:''}
    ${players.length?`<div style="margin-top:.75rem"><div class="sc-row"><span class="l">Online players</span><span class="v">${online}</span></div>
      <div class="players-list">${players.map(p=>`<a href="/player.html?name=${encodeURIComponent(p)}"><img src="${avatarUrl(p)}" alt=""/>${p}</a>`).join('')}</div></div>`:''}
    <div class="sc-updated">Updated ${fmtTimeAgo(s.lastUpdated)}</div>
    ${srv.isPvP?`<div style="margin-top:1rem"><a href="/leaderboard.html" class="btn btn-ghost" style="width:100%;justify-content:center">View Tiers →</a></div>`:''}
  </div>`;
}
async function loadServers(targetId) {
  const target = document.getElementById(targetId);
  if (!target) return;
  const all = await db('/servers');
  if (!all) { target.innerHTML = '<div class="empty">No servers reporting yet</div>'; return; }
  target.innerHTML = SERVER_LIST.map(s => renderServerCard(s, all[s.key]?.status)).join('');
}
function initServersPage() {
  loadServers('server-grid');
  setInterval(()=>loadServers('server-grid'), 15000);
}
