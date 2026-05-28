// [ZypherMC] Spectate live PvP matches
async function loadSpectateList() {
  const listEl = document.getElementById('spec-list');
  if (!listEl) return;
  const matchId = qs('match');
  if (matchId) return loadSpectateMatch(matchId);
  listEl.innerHTML = skeleton(3);
  const active = await db('/pvp/active_matches');
  const arr = objToArr(active);
  listEl.innerHTML = arr.length ? `<div class="grid grid-2">${arr.map(m=>{
    const p1=m.players?.[0],p2=m.players?.[1];
    const dur = Math.floor((Date.now()-(m.startTime||Date.now()))/1000);
    return `<a href="/spectate.html?match=${m._key}" class="card tilt" style="display:block;color:inherit"><div class="flex-between"><strong>${m.gameMode||'—'}</strong><span class="tag green">${fmtDuration(dur)}</span></div>
      <div class="flex" style="margin-top:1rem;justify-content:space-around">
        <div style="text-align:center"><img class="avatar" src="${avatarUrl(p1)}"/><div>${p1}</div></div>
        <div>VS</div>
        <div style="text-align:center"><img class="avatar" src="${avatarUrl(p2)}"/><div>${p2}</div></div>
      </div></a>`;
  }).join('')}</div>` : '<div class="empty">No live matches to spectate</div>';
}
async function loadSpectateMatch(id) {
  const root = document.getElementById('spec-list');
  const render = async () => {
    const m = await db('/pvp/active_matches/'+id);
    if (!m) { root.innerHTML='<div class="empty">Match ended</div>'; return false; }
    const p1=m.players?.[0],p2=m.players?.[1];
    const hp1=m.currentHP?.p1??20, hp2=m.currentHP?.p2??20;
    const dur = Math.floor((Date.now()-(m.startTime||Date.now()))/1000);
    root.innerHTML = `<div class="card">
      <div class="flex-between"><h2>${m.gameMode||'Match'}</h2><span class="tag green">LIVE · ${fmtDuration(dur)}</span></div>
      <div class="grid grid-2" style="margin-top:1.5rem">
        ${[[p1,hp1,m.currentKills?.p1,m.currentArrows?.p1,m.currentPotions?.p1],[p2,hp2,m.currentKills?.p2,m.currentArrows?.p2,m.currentPotions?.p2]].map(([n,hp,k,a,p])=>`
          <div class="card"><div class="flex"><img class="avatar" style="width:48px;height:48px" src="${avatarUrl(n)}"/><div><strong>${n}</strong></div></div>
            <div style="margin-top:.75rem"><div class="l">HP</div><div class="bar ${hp<7?'red':hp<14?'yellow':'green'}"><div style="width:${(hp/20)*100}%"></div></div><div style="text-align:right;font-size:.85rem">${hp}/20 ❤</div></div>
            <div class="sc-row"><span class="l">Kills</span><span class="v">${k??0}</span></div>
            <div class="sc-row"><span class="l">Arrows</span><span class="v">${a??0}</span></div>
            <div class="sc-row"><span class="l">Potions</span><span class="v">${p??0}</span></div>
          </div>`).join('')}
      </div>
      <div style="text-align:center;margin-top:1rem"><a href="/spectate.html" class="btn btn-ghost">← All matches</a></div>
    </div>`;
    return true;
  };
  const ok = await render();
  if (ok) setInterval(render, 3000);
}
