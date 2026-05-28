// [ZypherMC] Player profile renderer (PvP + all-servers stats)
async function loadPlayerPage() {
  const name = qs('name');
  if (!name) { document.getElementById('player-root').innerHTML = '<div class="empty">No player specified</div>'; return; }
  document.title = `${name} — ZypherMC`;
  const root = document.getElementById('player-root');
  root.innerHTML = `<div class="skeleton" style="height:200px;margin-bottom:1rem"></div>${skeleton(6)}`;

  const [pvpStats, pvpElo, history, achievements, serversAll] = await Promise.all([
    db(`/pvp/players/${name}/stats`),
    db(`/pvp/players/${name}/elo`),
    db(`/pvp/players/${name}/history`),
    db(`/pvp/players/${name}/achievements`),
    db('/servers')
  ]);

  // current-on detection
  let currentOn = null;
  const serverInfo = {};
  if (serversAll) {
    for (const [sk, sv] of Object.entries(serversAll)) {
      const me = sv?.players?.[name];
      if (me) serverInfo[sk] = me;
      if (me?.online && !currentOn) currentOn = sk;
    }
  }

  const overall = pvpElo?.overall;
  const elo = overall?.currentElo ?? 0;
  const tier = tierFromElo(elo);
  const tierStyle = tier.color==='rainbow'?'background:linear-gradient(90deg,#ff0080,#9b35e8,#00d4ff,#00ff88,#ffd700,#ff0080);-webkit-background-clip:text;background-clip:text;color:transparent':`color:${tier.color}`;

  const hero = `
    <div class="player-hero fade-up">
      <img class="head" src="${headUrl(name)}" alt="${name}"/>
      <div style="flex:1;min-width:240px">
        <h1>${name}</h1>
        <div class="meta">
          ${pvpStats ? `<span class="tag">PvP Rank #${fmtNum(pvpStats.globalRank)}</span>` : ''}
          ${overall ? `<span class="tag gold">ELO ${fmtNum(elo)}</span><span class="tag" style="${tierStyle}">${tier.name}</span>` : ''}
          ${currentOn ? `<span class="current-on">● Currently on: ${currentOn.toUpperCase()}</span>` : '<span class="tag">Offline</span>'}
        </div>
      </div>
    </div>`;

  let pvpSection = '';
  if (pvpStats || pvpElo) {
    const s = pvpStats || {};
    pvpSection = `
      <section class="reveal">
        <h2 class="section-title">⚔️ PvP Statistics</h2>
        <div class="stat-grid">
          <div class="stat-pill"><div class="v">${fmtNum(s.wins)}</div><div class="l">Wins</div></div>
          <div class="stat-pill"><div class="v">${fmtNum(s.losses)}</div><div class="l">Losses</div></div>
          <div class="stat-pill"><div class="v">${fmtNum(s.totalKills)}</div><div class="l">Total Kills</div></div>
          <div class="stat-pill"><div class="v">${fmtNum(s.totalDeaths)}</div><div class="l">Total Deaths</div></div>
          <div class="stat-pill"><div class="v">${fmtNum(s.highestKillStreak)}</div><div class="l">Best Streak</div></div>
          <div class="stat-pill"><div class="v">${fmtPercent(s.arrowAccuracyPercent)}</div><div class="l">Arrow Acc</div></div>
          <div class="stat-pill"><div class="v">${fmtPercent(s.headshotPercent)}</div><div class="l">Headshot %</div></div>
          <div class="stat-pill"><div class="v">${fmtNum(s.totalDamageDealt)}</div><div class="l">Damage Dealt</div></div>
          <div class="stat-pill"><div class="v">${fmtNum(s.bestWinStreak)}</div><div class="l">Win Streak</div></div>
          <div class="stat-pill"><div class="v">${fmtNum(s.clutchWins)}</div><div class="l">Clutch Wins</div></div>
          <div class="stat-pill"><div class="v">${fmtNum(s.comebackWins)}</div><div class="l">Comebacks</div></div>
          <div class="stat-pill"><div class="v">${fmtDuration(s.totalMatchDurationSeconds)}</div><div class="l">Time Played</div></div>
        </div>
      </section>`;
    if (pvpElo) {
      const modes = Object.entries(pvpElo).filter(([k])=>k!=='overall');
      pvpSection += `<section class="reveal"><h2 class="section-title">Per-Gamemode ELO</h2>
        <div class="gamemode-grid">${modes.map(([m,d])=>`
          <div class="gm-card">
            <div class="gm-name">${m}</div>
            <div class="gm-elo">${fmtNum(d.currentElo)}</div>
            <div style="font-size:.8rem;color:var(--text-secondary);margin-top:.25rem">Peak ${fmtNum(d.peakElo)} · ${fmtNum(d.gamesPlayed)} games · ${fmtPercent(d.winRate)}</div>
            ${tierBadge(d.currentElo)}
          </div>`).join('')}</div></section>`;
    }
    if (achievements && achievements.length) {
      pvpSection += `<section class="reveal"><h2 class="section-title">🏆 Achievements</h2>
        <div class="grid grid-3">${achievements.map(a=>`
          <div class="card"><strong>${a.icon||'🏆'} ${a.name}</strong><div style="color:var(--text-secondary);font-size:.85rem;margin-top:.25rem">${a.desc||''}</div><div class="tag gold" style="margin-top:.5rem">${a.rarity||'Common'}</div></div>`).join('')}</div></section>`;
    }
    if (history && Object.keys(history).length) {
      const ids = Array.isArray(history) ? history.filter(Boolean).slice(-10).reverse() : Object.values(history).slice(-10).reverse();
      const matches = await Promise.all(ids.map(id => db('/pvp/matches/'+id)));
      pvpSection += `<section class="reveal"><h2 class="section-title">Recent Matches</h2>
        <table><thead><tr><th>Mode</th><th>Result</th><th>Opponent</th><th>ELO Δ</th><th class="hide-mobile">Duration</th></tr></thead>
        <tbody>${matches.filter(Boolean).map(m=>{
          const isP1 = m.players?.[0]===name;
          const opp = isP1 ? m.players?.[1] : m.players?.[0];
          const won = m.winner===name;
          const dElo = isP1 ? m.eloChange?.p1 : m.eloChange?.p2;
          return `<tr><td>${m.gameMode||'—'}</td><td><span class="tag ${won?'green':'red'}">${won?'Win':'Loss'}</span></td>
          <td><a href="/player.html?name=${encodeURIComponent(opp)}">${opp||'—'}</a></td>
          <td style="color:${dElo>=0?'var(--accent-green)':'var(--accent-red)'}">${dElo>=0?'+':''}${fmtNum(dElo)}</td>
          <td class="hide-mobile">${fmtDuration(m.timestamps?.durationSeconds)}</td></tr>`;
        }).join('')}</tbody></table></section>`;
    }
  }

  const otherKeys = Object.keys(serverInfo).filter(k=>k!=='pvp');
  let otherSection = '';
  if (otherKeys.length) {
    otherSection = `<section class="reveal"><h2 class="section-title">🌐 Other Servers</h2>
      <div class="grid grid-2">${otherKeys.map(k=>{
        const m = serverInfo[k];
        return `<div class="card">
          <h3>${k.toUpperCase()} ${m.online?'<span class="tag green">Online</span>':''}</h3>
          <div class="sc-row"><span class="l">Playtime</span><span class="v">${fmtDuration(m.playtimeSeconds)}</span></div>
          <div class="sc-row"><span class="l">Kills</span><span class="v">${fmtNum(m.kills)}</span></div>
          <div class="sc-row"><span class="l">Deaths</span><span class="v">${fmtNum(m.deaths)}</span></div>
          <div class="sc-row"><span class="l">Last seen</span><span class="v">${fmtTimeAgo(m.lastSeen)}</span></div>
        </div>`;
      }).join('')}</div></section>`;
  }

  if (!pvpStats && !pvpElo && !otherKeys.length) {
    root.innerHTML = hero + '<div class="empty">No data found for this player across the network</div>';
    return;
  }
  root.innerHTML = hero + pvpSection + otherSection;
}
