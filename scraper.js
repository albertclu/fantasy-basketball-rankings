const fetch = require('node-fetch');
const fs    = require('fs');

const ESPN_S2 = process.env.ESPN_S2;
const SWID    = process.env.SWID;

if (!ESPN_S2 || !SWID) {
  console.error('❌  Missing ESPN_S2 or SWID environment variables.');
  process.exit(1);
}

const LEAGUE_ID = '24352';
const SEASON_ID = '2026';

const STAT = {
  pts:     0,
  blk:     1,
  stl:     2,
  ast:     3,
  reb:     6,
  threePM: 17,
  fgm:     19,
  fga:     20,
  ftm:     40,
  fta:     41,
  gp:      38,
};

async function espnFetch(views) {
  const viewParams = views.map(v => `view=${v}`).join('&');
  const url = `https://fantasy.espn.com/apis/v3/games/fba/seasons/${SEASON_ID}/segments/0/leagues/${LEAGUE_ID}?${viewParams}`;
  console.log(`Fetching: ${url}`);

  const res = await fetch(url, {
    headers: {
      'Cookie':           `espn_s2=${ESPN_S2}; SWID=${SWID}`,
      'Accept':           'application/json',
      'x-fantasy-source': 'kona',
      'x-fantasy-filter': JSON.stringify({"teams":{"limit":20}}),
      'User-Agent':       'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Referer':          `https://fantasy.espn.com/basketball/league/standings?leagueId=${LEAGUE_ID}`,
      'Origin':           'https://fantasy.espn.com',
    },
  });

  const text = await res.text();

  if (!res.ok || text.trim().startsWith('<')) {
    // Save the response so we can see what ESPN returned
    fs.mkdirSync('data', { recursive: true });
    fs.writeFileSync('data/error_response.html', text);
    throw new Error(`HTTP ${res.status} — ESPN returned HTML instead of JSON. Saved to data/error_response.html`);
  }

  return JSON.parse(text);
}

function safeGet(obj, id) {
  const v = obj?.[String(id)];
  return (v !== undefined && v !== null && !isNaN(v)) ? Number(v) : 0;
}

function parseTeams(data) {
  if (!Array.isArray(data.teams) || data.teams.length === 0) {
    fs.mkdirSync('data', { recursive: true });
    fs.writeFileSync('data/raw_api_response.json', JSON.stringify(data, null, 2));
    throw new Error('No teams in API response. Saved to data/raw_api_response.json');
  }

  return data.teams.map(team => {
    const name = team.name || team.nickname || team.abbrev || `Team ${team.id}`;
    const s    = team.valuesByStat || {};

    const fgm     = safeGet(s, STAT.fgm);
    const fga     = safeGet(s, STAT.fga);
    const ftm     = safeGet(s, STAT.ftm);
    const fta     = safeGet(s, STAT.fta);
    const threePM = safeGet(s, STAT.threePM);
    const reb     = safeGet(s, STAT.reb);
    const ast     = safeGet(s, STAT.ast);
    const stl     = safeGet(s, STAT.stl);
    const blk     = safeGet(s, STAT.blk);
    const pts     = safeGet(s, STAT.pts);
    const gp      = safeGet(s, STAT.gp) || 550;

    return {
      name,
      fgPct:   parseFloat((fga > 0 ? fgm / fga : 0).toFixed(8)),
      ftPct:   parseFloat((fta > 0 ? ftm / fta : 0).toFixed(8)),
      threePM: Math.round(threePM),
      reb:     Math.round(reb),
      ast:     Math.round(ast),
      stl:     Math.round(stl),
      blk:     Math.round(blk),
      pts:     Math.round(pts),
      gp:      Math.round(gp),
    };
  }).filter(t => t.pts > 0 || t.reb > 0);
}

async function run() {
  try {
    console.log('🏀 Fetching ESPN Fantasy Basketball data...');

    // Try the views ESPN actually uses on the standings page
    const data = await espnFetch([
      'mLiveScoring',
      'mMatchupScore', 
      'mRoster',
      'mTeam',
      'mPendingTransactions'
    ]);

    fs.mkdirSync('data', { recursive: true });
    fs.writeFileSync('data/raw_api_response.json', JSON.stringify(data, null, 2));
    console.log('📄 Raw response saved → data/raw_api_response.json');

    const teams = parseTeams(data);

    const totalPts = teams.reduce((sum, t) => sum + t.pts, 0);
    if (totalPts === 0) {
      console.warn('⚠️  All PTS = 0. Check data/raw_api_response.json for correct stat IDs.');
    }

    fs.writeFileSync('data/teams.json', JSON.stringify(teams, null, 2));
    console.log(`\n✅ Saved ${teams.length} teams to data/teams.json:\n`);
    teams.forEach((t, i) => {
      console.log(
        `  ${String(i+1).padStart(2)}. ${t.name.padEnd(28)} ` +
        `FG: ${t.fgPct.toFixed(4)}  PTS: ${String(t.pts).padStart(6)}  GP: ${t.gp}`
      );
    });

  } catch (err) {
    console.error('\n❌ Scraper failed:', err.message);
    if (err.message.includes('401') || err.message.includes('403')) {
      console.error('🔑  Cookies expired — update ESPN_S2 in GitHub Secrets.');
    }
    process.exit(1);
  }
}

run();
