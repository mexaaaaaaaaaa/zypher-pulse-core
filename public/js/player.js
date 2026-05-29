// [ZypherMC] Player profile renderer — bound to real Firebase structure.
// PvP stats: /pvp/players/{name}  (flat: elo, kills, deaths, tier, bestStreak, currentStreak)
// Network:   /players/{name}/network (online, currentServer, favoriteServer, lastSeen, totalPlaytimeSecs, serverHistory)
// Presence:  /servers/{key}/players/{name}
async function loadPlayerPage() {
  const name = qs('name');
  if (!name) { document.getElementById('player-root').innerHTML = '<div class="empty">No player specified</div>'; return; }
  document.title = `${name} — ZypherMC`;
  const root = document.getElementById('player-root');
  root.innerHTML = `<div class="skeleton" style="height:200px;margin-bottom:1rem"></div>${skeleton(6)}`;

  const [pvp, net, serversAll] = await Promise.all([
    db(`/pvp/players/${name}`),
    db(`/players/${name}/network`),
    db('/servers')
  ]);

  // Where is the player right now? scan each server's players list.
  let currentOn = net?.online ? (net.currentServer || null) : null;
  const serverInfo = {};
  if (serversAll) {
    for (const [sk, sv] of Object.entries(serversAll)) {
      const me = sv?.players?.[name];
      if (me) serverInfo[sk] = me;
      if (me?.online && !currentOn) currentOn = sk;
    }
  }

  const elo = pvp?.elo ?? 0;
  const tierName = pvp?.tier ? (pvp.tier.charAt(0)+pvp.tier.slice(1).toLowerCase()) : tierFromElo(elo).name;

  const hero = `
    <div class="player-hero fade-up">
      <img class="head" src="${headUrl(name)}" alt="${name}"/>
      <div style="flex:1;min-width:240px">
        <h1>${name}</h1>
        <div class="meta">
          ${pvp ? `<span class="tag gold">ELO ${fmtNum(elo)}</span><span class="tier-badge">${tierName}</span>` : ''}
          ${currentOn ? `<span class="current-on">● Currently on: ${currentOn.toUpperCase()}</span>` : '<span class="tag">Offline</span>'}
        </div>
      </div>
    </div>`;

  // PvP statistics (only the fields the DB actually stores)
  let pvpSection = '';
  if (pvp) {
    pvpSection = `
      <section class="reveal">
        <h2 class="section-title">⚔️ PvP Statistics</h2>
        <div class="stat-grid">
          <div class="stat-pill"><div class="v">${fmtNum(pvp.elo)}</div><div class="l">ELO</div></div>
          <div class="stat-pill"><div class="v">${tierName}</div><div class="l">Tier</div></div>
          <div class="stat-pill"><div class="v">${fmtNum(pvp.kills)}</div><div class="l">Kills</div></div>
          <div class="stat-pill"><div class="v">${fmtNum(pvp.deaths)}</div><div class="l">Deaths</div></div>
          <div class="stat-pill"><div class="v">${pvp.deaths?(pvp.kills/pvp.deaths).toFixed(2):fmtNum(pvp.kills)}</div><div class="l">KDR</div></div>
          <div class="stat-pill"><div class="v">${fmtNum(pvp.currentStreak)}</div><div class="l">Current Streak</div></div>
          <div class="stat-pill"><div class="v">${fmtNum(pvp.bestStreak)}</div><div class="l">Best Streak</div></div>
          <div class="stat-pill"><div class="v">${fmtTimeAgo(pvp.lastUpdated)}</div><div class="l">Updated</div></div>
        </div>
      </section>`;
  }

  // Network / playtime summary from /players/{name}/network
  let networkSection = '';
  if (net) {
    const history = Array.isArray(net.serverHistory) ? net.serverHistory.slice().reverse().slice(0,10) : [];
    networkSection = `
      <section class="reveal"><h2 class="section-title">🌐 Network Activity</h2>
        <div class="stat-grid">
          <div class="stat-pill"><div class="v">${net.online?'Online':'Offline'}</div><div class="l">Status</div></div>
          <div class="stat-pill"><div class="v">${(net.favoriteServer||'—').toString().toUpperCase()}</div><div class="l">Favorite</div></div>
          <div class="stat-pill"><div class="v">${fmtNum(net.totalJoins)}</div><div class="l">Total Joins</div></div>
          <div class="stat-pill"><div class="v">${fmtDuration(net.totalPlaytimeSecs)}</div><div class="l">Playtime</div></div>
          <div class="stat-pill"><div class="v">${fmtTimeAgo(net.lastSeen)}</div><div class="l">Last Seen</div></div>
        </div>
        ${history.length?`<h3 style="margin-top:1.5rem">Recent Servers</h3>
        <table><thead><tr><th>Server</th><th>Duration</th><th class="hide-mobile">Joined</th></tr></thead>
        <tbody>${history.map(h=>`<tr><td>${(h.server||'—').toUpperCase()}</td><td>${fmtDuration(h.durationSecs)}</td>
          <td class="hide-mobile">${fmtTimeAgo(h.joinedAt)}</td></tr>`).join('')}</tbody></table>`:''}
      </section>`;
  }

  if (!pvp && !net) {
    root.innerHTML = hero + '<div class="empty">No data found for this player across the network</div>';
    return;
  }
  root.innerHTML = hero + pvpSection + networkSection;
}
