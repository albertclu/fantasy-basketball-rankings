/**
 * ESPN Fantasy Basketball API Scraper
 * League: GQ Fantasy Basketball (ID: 24352)
 *
 * Credentials are read from environment variables so they stay secret:
 *   ESPN_S2  →  set as a GitHub Secret
 *   SWID     →  set as a GitHub Secret
 *
 * To run locally:
 *   ESPN_S2="your_value" SWID="your_value" node scraper.js
 */

const fetch = require('node-fetch');
const fs    = require('fs');

// ─── CREDENTIALS (from environment variables) ─────────────────────────────────
const ESPN_S2 = process.env.ESPN_S2;
const SWID    = process.env.SWID;

if (!ESPN_S2 || !SWID) {
  console.error('\n❌  Missing credentials!');
  console.error('   Set ESPN_S2 and SWID as environment variables.');
  console.error('   Locally:  ESPN_S2="..." SWID="..." node scraper.js');
  console.error('   GitHub:   Add ESPN_S2 and SWID in repo Settings → Secrets → Actions\n');
  process.exit(1);
}
// ─────────────────────────────────────────────────────────────────────────────

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

async function espnFetch(view) {
  const url = `https://fantasy.espn.com/apis/v3/games/fba/seasons/${SEASON_ID}/segments/0/leagues/${LEAGUE_ID}?view=${view}`;
  fs.mkdirSync('data', { recursive: true });
  console.log(`Fetching: ${url}`);

  const res = await fetch(url, {
    headers: {
      'Cookie':           `espn_s2=${ESPN_S2}; SWID=${SWID}`,
      'Accept':           'application/json',
      'x-fantasy-source': 'kona',
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HTTP ${res.status} from ESPN API:\n${body.slice(0, 400)}`);
  }
  return res.json();
}

function safeGet(obj, id) {
  const v = obj?.[String(id)];
  return (v !== undefined && v !== null && !isNaN(v)) ? Number(v) : 0;
}

function parseTeams(data) {
  if (!Array.isArray(data.teams) || data.teams.length === 0) {
    fs.writeFileSync('data/raw_api_response.json', JSON.stringify(data, null, 2));
    throw new Error('No teams in API response. Dumped to raw_api_response.json for debugging.');
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

    const data  = await espnFetch('mTeam');
    const teams = parseTeams(data);

    const totalPts = teams.reduce((sum, t) => sum + t.pts, 0);
    if (totalPts === 0) {
      console.warn('⚠️  All PTS values are 0 — stat IDs may need updating.');
      fs.writeFileSync('data/raw_api_response.json', JSON.stringify(data, null, 2));
    }

    fs.writeFileSync('data/teams.json', JSON.stringify(teams, null, 2));

    console.log(`\n✅ Saved ${teams.length} teams to teams.json:\n`);
    teams.forEach((t, i) => {
      console.log(
        `  ${String(i + 1).padStart(2)}. ${t.name.padEnd(28)} ` +
        `FG: ${t.fgPct.toFixed(4)}  PTS: ${String(t.pts).padStart(6)}  GP: ${t.gp}`
      );
    });

  } catch (err) {
    console.error('\n❌ Scraper failed:', err.message);
    if (err.message.includes('401') || err.message.includes('403')) {
      console.error('🔑  Cookies may be expired — update ESPN_S2 and SWID in GitHub Secrets.');
    }
    process.exit(1);
  }
}

run();
