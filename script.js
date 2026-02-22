// Store teams data
let teamsData = [];

// Sample data from ESPN Fantasy Basketball
const sampleData = [
  { name: "Jalen, Jaylen and Jalen", fgPct: 0.48669528, ftPct: 0.82133126, threePM: 1030, reb: 3584, ast: 2712, stl: 589, blk: 276, pts: 11078, gp: 545 },
  { name: "ABOVE the RlM", fgPct: 0.47252888, ftPct: 0.80353473, threePM: 1071, reb: 3264, ast: 2446, stl: 648, blk: 437, pts: 10388, gp: 549 },
  { name: "Bottom of the Barrel", fgPct: 0.47629797, ftPct: 0.81754818, threePM: 1020, reb: 3859, ast: 2424, stl: 634, blk: 298, pts: 10610, gp: 550 },
  { name: "Ausur About That?", fgPct: 0.48289738, ftPct: 0.7852377, threePM: 931, reb: 3319, ast: 2408, stl: 643, blk: 430, pts: 10014, gp: 556 },
  { name: "One Bad Trae'd", fgPct: 0.49835571, ftPct: 0.81208333, threePM: 944, reb: 3321, ast: 1911, stl: 467, blk: 405, pts: 10167, gp: 549 },
  { name: "King Con", fgPct: 0.46195366, ftPct: 0.82242152, threePM: 1089, reb: 2972, ast: 2375, stl: 548, blk: 417, pts: 9941, gp: 519 },
  { name: "Golden State of Mind", fgPct: 0.48764648, ftPct: 0.81090724, threePM: 1058, reb: 3007, ast: 1800, stl: 583, blk: 422, pts: 9557, gp: 534 },
  { name: "Mo Bamba Mo Problems", fgPct: 0.50431948, ftPct: 0.71299735, threePM: 590, reb: 3431, ast: 2407, stl: 593, blk: 367, pts: 8122, gp: 513 },
  { name: "Free Kel'el Ware!!", fgPct: 0.48475058, ftPct: 0.78672986, threePM: 912, reb: 3301, ast: 2051, stl: 562, blk: 365, pts: 10074, gp: 574 },
  { name: "One Dollar Tippers", fgPct: 0.46647441, ftPct: 0.8147986, threePM: 929, reb: 3303, ast: 2218, stl: 542, blk: 333, pts: 9260, gp: 548 }
  ];

// ESPN Fantasy Basketball constants for team links
const LEAGUE_ID = 24352;
const SEASON_ID = 2026;

// Mapping of team names to their team IDs
const TEAM_ID_MAP = {
    "Jalen, Jaylen and Jalen": 5,
    "ABOVE the RIM": 3,
    "Bottom of the Barrel": 6,
    "Ausur About That?": 4,
    "One Bad Trae'd": 8,
    "King Con": 1,
    "Golden State of Mind": 9,
    "Mo Bamba Mo Problems": 10,
    "Free Kel'el Ware!!": 2,
    "One Dollar Tippers": 7
};

// Function to rank teams on a 1-10 scale for each category
function rankTeams() {
    if (teamsData.length === 0) return [];

  // Create array of teams with their per-game averages pre-calculated
  const rankings = teamsData.map(team => {
        const gp = team.gp || 550;
        return {
                ...team,
                threePMAvg: team.threePM / gp,
                rebAvg: team.reb / gp,
                astAvg: team.ast / gp,
                stlAvg: team.stl / gp,
                blkAvg: team.blk / gp,
                ptsAvg: team.pts / gp,
                categoryRanks: {}
        };
  });

  // Rank FG% and FT% based on percentage values
  ['fgPct', 'ftPct'].forEach(cat => {
        const sorted = [...rankings].sort((a, b) => b[cat] - a[cat]);
        rankings.forEach(team => {
                const rank = sorted.findIndex(t => t === team) + 1;
                team.categoryRanks[cat] = 11 - rank;
        });
  });

  // Rank other stats based on per-game averages
  const avgCategories = [
    { name: 'threePM', key: 'threePMAvg' },
    { name: 'reb', key: 'rebAvg' },
    { name: 'ast', key: 'astAvg' },
    { name: 'stl', key: 'stlAvg' },
    { name: 'blk', key: 'blkAvg' },
    { name: 'pts', key: 'ptsAvg' }
      ];

  avgCategories.forEach(cat => {
        const sorted = [...rankings].sort((a, b) => b[cat.key] - a[cat.key]);
        rankings.forEach(team => {
                const rank = sorted.findIndex(t => t === team) + 1;
                team.categoryRanks[cat.name] = 11 - rank;
        });
  });

  // Calculate total score
  rankings.forEach(team => {
        team.totalScore = Object.values(team.categoryRanks).reduce((a, b) => a + b, 0);
  });

  // Sort by total score
  rankings.sort((a, b) => b.totalScore - a.totalScore);
    return rankings;
}

// Function to update and display results
function updateResults() {
    const ranked = rankTeams();
    const tbody = document.getElementById('resultsBody');

  if (ranked.length === 0) {
        tbody.innerHTML = '<tr><td colspan="25" class="message">No data yet. Load sample data to get started!</td></tr>';
        return;
  }

  tbody.innerHTML = ranked.map((team, index) => {
        return `
              <tr>
                      <td class="rank">#${index + 1}</td>
                              <td class="team-name">${team.name}</td>
                                      <td class="score">${team.totalScore}</td>
                                              <td class="stat-cell">${team.fgPct.toFixed(3)}</td>
                                                      <td class="stat-cell rank-cell">${team.categoryRanks.fgPct}</td>
                                                            <td class="stat-cell">${team.ftPct.toFixed(3)}</td>                              
                                                                      <td class="stat-cell rank-cell">${team.categoryRanks.ftPct}</td>
                                                                              <td class="stat-cell">${team.threePM}</td>
                                                                                      <td class="stat-cell">${team.threePMAvg.toFixed(2)}</td>
                                                                                              <td class="stat-cell rank-cell">${team.categoryRanks.threePM}</td>
                                                                                                      <td class="stat-cell">${team.reb}</td>
                                                                                                              <td class="stat-cell">${team.rebAvg.toFixed(2)}</td>
                                                                                                                      <td class="stat-cell rank-cell">${team.categoryRanks.reb}</td>
                                                                                                                              <td class="stat-cell">${team.ast}</td>
                                                                                                                                      <td class="stat-cell">${team.astAvg.toFixed(2)}</td>
                                                                                                                                              <td class="stat-cell rank-cell">${team.categoryRanks.ast}</td>
                                                                                                                                                      <td class="stat-cell">${team.stl}</td>
                                                                                                                                                              <td class="stat-cell">${team.stlAvg.toFixed(2)}</td>
                                                                                                                                                                      <td class="stat-cell rank-cell">${team.categoryRanks.stl}</td>
                                                                                                                                                                              <td class="stat-cell">${team.blk}</td>
                                                                                                                                                                                      <td class="stat-cell">${team.blkAvg.toFixed(2)}</td>
                                                                                                                                                                                              <td class="stat-cell rank-cell">${team.categoryRanks.blk}</td>
                                                                                                                                                                                                      <td class="stat-cell">${team.pts}</td>
                                                                                                                                                                                                              <td class="stat-cell">${team.ptsAvg.toFixed(2)}</td>
                                                                                                                                                                                                                      <td class="stat-cell rank-cell">${team.categoryRanks.pts}</td>            <td class="stat-cell">${team.gp}</td>
                                                                                                                                                                                                                            </tr>
                                                                                                                                                                                                                                `;
  }).join('');
}

// Initialize on page load — always fetch fresh data from teams.json
document.addEventListener('DOMContentLoaded', function() {
    fetch('data/teams.json?v=' + new Date().getTime())
        .then(response => response.json())
        .then(data => {
            teamsData = data;
            updateResults();
            const now = new Date();
            document.getElementById('lastUpdated').textContent = 'Last updated: ' + now.toLocaleString();
        })
        .catch(() => {
            // Fallback to sample data if fetch fails
            teamsData = JSON.parse(JSON.stringify(sampleData));
            updateResults();
        });
});
