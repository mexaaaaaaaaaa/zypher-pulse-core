// [ZypherMC] Network-wide stats
async function loadStats() {
  const root = document.getElementById('stats-root');
  root.innerHTML = skeleton(6);
  const [pvp, net] = await Promise.all([db('/pvp/server/stats'), db('/network/status')]);
  const s = pvp || {}, n = net || {};
  root.innerHTML = `
    <section><h2 class="section-title">Network</h2>
      <div class="grid grid-4">
        <div class="card stat-card"><div class="num" data-countup="${n.totalPlayers||0}">0</div><div class="label">Players Online</div></div>
        <div class="card stat-card"><div class="num" data-countup="${n.totalOnlineServers||0}">0</div><div class="label">Servers Online</div></div>
        <div class="card stat-card"><div class="num">${n.networkVersion||'1.20.x'}</div><div class="label">Network Version</div></div>
        <div class="card stat-card"><div class="num">${fmtTimeAgo(n.lastUpdated)}</div><div class="label">Last Update</div></div>
      </div></section>
    <section><h2 class="section-title">PvP All-Time</h2>
      <div class="grid grid-3">
        <div class="card stat-card"><div class="num" data-countup="${s.totalMatchesAllTime||0}">0</div><div class="label">Total Matches</div></div>
        <div class="card stat-card"><div class="num" data-countup="${s.totalPlayersAllTime||0}">0</div><div class="label">Total Players</div></div>
        <div class="card stat-card"><div class="num" data-countup="${s.totalKillsAllTime||0}">0</div><div class="label">Total Kills</div></div>
        <div class="card stat-card"><div class="num" data-countup="${s.totalHoursPlayedAllTime||0}">0</div><div class="label">Hours Played</div></div>
        <div class="card stat-card"><div class="num">${s.mostPopularGamemode||'—'}</div><div class="label">Top Gamemode</div></div>
        <div class="card stat-card"><div class="num">${fmtDuration(s.avgMatchDurationSeconds)}</div><div class="label">Avg Match</div></div>
      </div></section>
    <section><h2 class="section-title">Records</h2>
      <div class="grid grid-3">
        <div class="card"><div class="label">Highest ELO</div><div class="num" style="font-size:1.5rem">${fmtNum(s.recordElo)}</div><div>by <a href="/player.html?name=${encodeURIComponent(s.recordEloHolder||'')}">${s.recordEloHolder||'—'}</a></div></div>
        <div class="card"><div class="label">Longest Win Streak</div><div class="num" style="font-size:1.5rem">${fmtNum(s.recordWinStreak)}</div><div>by <a href="/player.html?name=${encodeURIComponent(s.recordWinStreakHolder||'')}">${s.recordWinStreakHolder||'—'}</a></div></div>
        <div class="card"><div class="label">Most Kills in Match</div><div class="num" style="font-size:1.5rem">${fmtNum(s.recordKillsInMatch)}</div></div>
        <div class="card"><div class="label">Matches Today</div><div class="num" style="font-size:1.5rem">${fmtNum(s.matchesToday)}</div></div>
        <div class="card"><div class="label">This Week</div><div class="num" style="font-size:1.5rem">${fmtNum(s.matchesThisWeek)}</div></div>
        <div class="card"><div class="label">New Players (week)</div><div class="num" style="font-size:1.5rem">${fmtNum(s.newPlayersThisWeek)}</div></div>
      </div></section>`;
  // re-observe countups
  document.querySelectorAll('[data-countup]').forEach(el => {
    const end = +el.dataset.countup; el.textContent = fmtNum(end);
  });
}
