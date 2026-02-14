// Store teams data
let teamsData = [];

// Sample data from ESPN Fantasy Basketball
const sampleData = [
  { name: "Jalen, Jaylen and Jalen", fgPct: 0.48669528, ftPct: 0.82133126, threePM: 1030, reb: 3584, ast: 2712, stl: 589, blk: 276, pts: 11078 },
  { name: "ABOVE the RlM", fgPct: 0.47252888, ftPct: 0.80353473, threePM: 1071, reb: 3264, ast: 2446, stl: 648, blk: 437, pts: 10388 },
  { name: "Bottom of the Barrel", fgPct: 0.47629797, ftPct: 0.81754818, threePM: 1020, reb: 3859, ast: 2424, stl: 634, blk: 298, pts: 10610 },
  { name: "Ausur About That?", fgPct: 0.48289738, ftPct: 0.7852377, threePM: 931, reb: 3319, ast: 2408, stl: 643, blk: 430, pts: 10014 },
  { name: "One Bad Trae'd", fgPct: 0.49835571, ftPct: 0.81208333, threePM: 944, reb: 3321, ast: 1911, stl: 467, blk: 405, pts: 10167 },
  { name: "King Con", fgPct: 0.46195366, ftPct: 0.82242152, threePM: 1089, reb: 2972, ast: 2375, stl: 548, blk: 417, pts: 9941 },
  { name: "Golden State of Mind", fgPct: 0.48764648, ftPct: 0.81090724, threePM: 1058, reb: 3007, ast: 1800, stl: 583, blk: 422, pts: 9557 },
  { name: "Mo Bamba Mo Problems", fgPct: 0.50431948, ftPct: 0.71299735, threePM: 590, reb: 3431, ast: 2407, stl: 593, blk: 367, pts: 8122 },
  { name: "Free Kel'el Ware!!", fgPct: 0.48475058, ftPct: 0.78672986, threePM: 912, reb: 3301, ast: 2051, stl: 562, blk: 365, pts: 10074 },
  { name: "One Dollar Tippers", fgPct: 0.46647441, ftPct: 0.8147986, threePM: 929, reb: 3303, ast: 2218, stl: 542, blk: 333, pts: 9260 }
  ];

// Function to add team manually
function addTeam() {
      const name = document.getElementById('teamName').value.trim();
      const fgPct = parseFloat(document.getElementById('fgPct').value);
      const ftPct = parseFloat(document.getElementById('ftPct').value);
      const threePM = parseInt(document.getElementById('threepm').value);
      const reb = parseInt(document.getElementById('reb').value);
      const ast = parseInt(document.getElementById('ast').value);
      const stl = parseInt(document.getElementById('stl').value);
      const blk = parseInt(document.getElementById('blk').value);
      const pts = parseInt(document.getElementById('pts').value);

    if (!name || isNaN(fgPct) || isNaN(ftPct) || isNaN(threePM) || isNaN(reb) || isNaN(ast) || isNaN(stl) || isNaN(blk) || isNaN(pts)) {
              alert('Please fill in all fields with valid values');
              return;
    }

    teamsData.push({ name, fgPct, ftPct, threePM, reb, ast, stl, blk, pts });
      clearInputs();
      updateResults();
}

// Function to clear input fields
function clearInputs() {
      document.getElementById('teamName').value = '';
      document.getElementById('fgPct').value = '';
      document.getElementById('ftPct').value = '';
      document.getElementById('threepm').value = '';
      document.getElementById('reb').value = '';
      document.getElementById('ast').value = '';
      document.getElementById('stl').value = '';
      document.getElementById('blk').value = '';
      document.getElementById('pts').value = '';
}

// Function to clear all data
function clearData() {
      if (confirm('Are you sure you want to clear all teams?')) {
                teamsData = [];
                clearInputs();
                updateResults();
      }
}

// Function to load sample data
function loadSampleData() {
      teamsData = JSON.parse(JSON.stringify(sampleData));
      clearInputs();
      updateResults();
}

// Function to rank teams on a 1-10 scale for each category
function rankTeams() {
      if (teamsData.length === 0) return [];

    const categories = ['fgPct', 'ftPct', 'threePM', 'reb', 'ast', 'stl', 'blk', 'pts'];

    // Calculate rankings for each category
    const rankings = teamsData.map(team => {
              const scores = {};
              categories.forEach(cat => {
                            // Get all values for this category
                                             const values = teamsData.map(t => t[cat]);
                            const sorted = [...values].sort((a, b) => b - a);
                            const maxVal = sorted[0];
                            const minVal = sorted[sorted.length - 1];

                                             // Rank on 1-10 scale (higher is better)
                                             if (maxVal === minVal) {
                                                               scores[cat] = 5; // If all same, give middle score
                                             } else {
                                                               scores[cat] = Math.round(((team[cat] - minVal) / (maxVal - minVal)) * 9) + 1;
                                             }
              });

                                           const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
              return { ...team, scores, totalScore };
    });

    // Sort by total score (descending)
    rankings.sort((a, b) => b.totalScore - a.totalScore);

    return rankings;
}

// Function to update and display results
function updateResults() {
      const ranked = rankTeams();
      const tbody = document.getElementById('resultsBody');

    if (ranked.length === 0) {
              tbody.innerHTML = '<tr><td colspan="4" class="message">No data yet. Add teams to get started!</td></tr>';
              return;
    }

    tbody.innerHTML = ranked.map((team, index) => {
              const categoryScoresHtml = Object.entries(team.scores)
                  .map(([cat, score]) => `<span class="category-score">${cat.toUpperCase()}: ${score}</span>`)
                  .join('');

                                         return `
                                                     <tr>
                                                                     <td class="rank">#${index + 1}</td>
                                                                                     <td class="team-name">${team.name}</td>
                                                                                                     <td class="score">${team.totalScore}</td>
                                                                                                                     <td><div class="category-breakdown">${categoryScoresHtml}</div></td>
                                                                                                                                 </tr>
                                                                                                                                         `;
    }).join('');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
      updateResults();
});
