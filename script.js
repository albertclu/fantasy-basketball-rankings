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

// Function to rank teams on a 1-10 scale for each category
function rankTeams() {
      if (teamsData.length === 0) return [];

    // First pass: Calculate per-game averages
    const rankings = teamsData.map(team => {
              const categoryRanks = {};
              const gp = team.gp || 550;
              const perGameAvgs = {
                            threePM: (team.threePM / gp).toFixed(2),
                            reb: (team.reb / gp).toFixed(2),
                            ast: (team.ast / gp).toFixed(2),
                            stl: (team.stl / gp).toFixed(2),
                            blk: (team.blk / gp).toFixed(2),
                            pts: (team.pts / gp).toFixed(2)
              };

                                           return { ...team, categoryRanks, perGameAvgs };
    });

    // Second pass: Calculate ranks for each category
    // For FG% and FT%: rank based on the percentage itself
    ['fgPct', 'ftPct'].forEach(cat => {
              const categoryValues = rankings.map(t => t[cat]);
              const sorted = [...categoryValues].sort((a, b) => b - a);

                                       rankings.forEach(team => {
                                                     const rank = sorted.findIndex(val => val === team[cat]) + 1;
                                                     team.categoryRanks[cat] = 11 - rank;
                                       });
    });

    // For other stats: rank based on per-game average
    ['threePM', 'reb', 'ast', 'stl', 'blk', 'pts'].forEach(cat => {
              const categoryValues = rankings.map(t => parseFloat(t.perGameAvgs[cat]));
              const sorted = [...categoryValues].sort((a, b) => b - a);

                                                                   rankings.forEach(team => {
                                                                                 const rank = sorted.findIndex(val => val === parseFloat(team.perGameAvgs[cat])) + 1;
                                                                                 team.categoryRanks[cat] = 11 - rank;
                                                                   });
    });

    // Calculate total score (sum of all category ranks)
    rankings.forEach(team => {
              team.totalScore = Object.values(team.categoryRanks).reduce((a, b) => a + b, 0);
    });

    // Sort by total score (descending - higher is better)
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
                                                                                                                                                                          <td class="stat-cell">${team.perGameAvgs.threePM}</td>
                                                                                                                                                                                          <td class="stat-cell rank-cell">${team.categoryRanks.threePM}</td>
                                                                                                                                                                                                          <td class="stat-cell">${team.reb}</td>
                                                                                                                                                                                                                          <td class="stat-cell">${team.perGameAvgs.reb}</td>
                                                                                                                                                                                                                                          <td class="stat-cell rank-cell">${team.categoryRanks.reb}</td>
                                                                                                                                                                                                                                                          <td class="stat-cell">${team.ast}</td>
                                                                                                                                                                                                                                                                          <td class="stat-cell">${team.perGameAvgs.ast}</td>
                                                                                                                                                                                                                                                                                          <td class="stat-cell rank-cell">${team.categoryRanks.ast}</td>
                                                                                                                                                                                                                                                                                                          <td class="stat-cell">${team.stl}</td>
                                                                                                                                                                                                                                                                                                                          <td class="stat-cell">${team.perGameAvgs.stl}</td>
                                                                                                                                                                                                                                                                                                                                          <td class="stat-cell rank-cell">${team.categoryRanks.stl}</td>
                                                                                                                                                                                                                                                                                                                                                          <td class="stat-cell">${team.blk}</td>
                                                                                                                                                                                                                                                                                                                                                                          <td class="stat-cell">${team.perGameAvgs.blk}</td>
                                                                                                                                                                                                                                                                                                                                                                                          <td class="stat-cell rank-cell">${team.categoryRanks.blk}</td>
                                                                                                                                                                                                                                                                                                                                                                                                          <td class="stat-cell">${team.pts}</td>
                                                                                                                                                                                                                                                                                                                                                                                                                          <td class="stat-cell">${team.perGameAvgs.pts}</td>
                                                                                                                                                                                                                                                                                                                                                                                                                                          <td class="stat-cell rank-cell">${team.categoryRanks.pts}</td>
                                                                                                                                                                                                                                                                                                                                                                                                                                                      </tr>
                                                                                                                                                                                                                                                                                                                                                                                                                                                              `;
    }).join('');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
      teamsData = JSON.parse(JSON.stringify(sampleData));
      updateResults();
});
