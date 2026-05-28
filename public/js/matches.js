// [ZypherMC] Matches (active + recent)
async function loadMatches() {
  const activeEl = document.getElementById('active-matches');
  const recentEl = document.getElementById('recent-matches');
  if (activeEl) activeEl.innerHTML = skeleton(2);
  if (recentEl) recentEl.innerHTML = skeleton(8);
  const [active, all] = await Promise.all([db('/pvp/active_matches'), db('/pvp/matches')]);
  if (activeEl) {
    const arr = objToArr(active);
    activeEl.innerHTML = arr.length ? arr.map(m=>{
      const p1=m.players?.[0],p2=m.players?.[1];
      return `<div class="card tilt"><div class="flex-between"><strong>${m.gameMode||'—'}</strong><span class="tag green">LIVE</span></div>
      <div class="flex" style="margin-top:1rem;justify-content:space-between">
        <div style="text-align:center"><img class="avatar" src="${avatarUrl(p1)}"/><div>${p1}</div><div style="color:var(--accent-red)">❤ ${m.currentHP?.p1??'—'}</div><div>Kills ${m.currentKills?.p1??0}</div></div>
        <div style="font-size:1.5rem;color:var(--accent-secondary)">VS</div>
        <div style="text-align:center"><img class="avatar" src="${avatarUrl(p2)}"/><div>${p2}</div><div style="color:var(--accent-red)">❤ ${m.currentHP?.p2??'—'}</div><div>Kills ${m.currentKills?.p2??0}</div></div>
      </div>
      <div style="text-align:center;margin-top:.75rem"><a href="/spectate.html?match=${m._key}" class="btn btn-primary">Spectate →</a></div></div>`;
    }).join('') : '<div class="empty">No active matches</div>';
  }
  if (recentEl) {
    const arr = objToArr(all).sort((a,b)=>(b.timestamps?.endTime||0)-(a.timestamps?.endTime||0)).slice(0,50);
    recentEl.innerHTML = arr.length ? `<table><thead><tr><th>Mode</th><th>Winner</th><th>Loser</th><th>Duration</th><th class="hide-mobile">ELO Δ</th><th class="hide-mobile">Type</th></tr></thead>
    <tbody>${arr.map(m=>`<tr><td>${m.gameMode||'—'}</td>
      <td><img class="avatar" src="${avatarUrl(m.winner)}"/><a href="/player.html?name=${encodeURIComponent(m.winner)}">${m.winner||'—'}</a></td>
      <td><img class="avatar" src="${avatarUrl(m.loser)}"/><a href="/player.html?name=${encodeURIComponent(m.loser)}">${m.loser||'—'}</a></td>
      <td>${fmtDuration(m.timestamps?.durationSeconds)}</td>
      <td class="hide-mobile" style="color:var(--accent-green)">+${fmtNum(Math.abs(m.eloChange?.p1||0))}</td>
      <td class="hide-mobile"><span class="tag ${m.winType==='dominant'?'gold':m.winType==='comeback'?'green':''}">${m.winType||'normal'}</span></td>
    </tr>`).join('')}</tbody></table>` : '<div class="empty">No matches recorded yet</div>';
  }
}
function initMatchesPage(){ loadMatches(); setInterval(loadMatches, 10000); }
