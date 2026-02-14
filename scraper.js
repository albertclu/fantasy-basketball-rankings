const fetch = require('node-fetch');
const fs = require('fs');
const cheerio = require('cheerio');

// Your league ID from ESPN
const LEAGUE_ID = '24352';
const ESPN_URL = `https://fantasy.espn.com/basketball/league/standings?leagueId=${LEAGUE_ID}`;

async function scrapeESPN() {
      try {
                console.log('Starting ESPN Fantasy Basketball scrape...');

          // Fetch the page
          const response = await fetch(ESPN_URL);
                const html = await response.text();

          // Load HTML into cheerio
          const $ = cheerio.load(html);

          // Extract team data from the Season Stats table
          const teams = [];
                const rows = $('table tbody tr');

          rows.each((index, element) => {
                        // Skip header rows
                                if ($(element).find('th').length > 0) return;

                                const cells = $(element).find('td');
                        if (cells.length < 10) return; // Need at least team name + 8 stats + GP

                                const teamName = $(cells[1]).text().trim();
                        if (!teamName) return;

                                // Extract the 8 key statistics
                                const stats = {
                                                  name: teamName,
                                                  fgPct: parseFloat($(cells[2]).text().trim()),
                                                  ftPct: parseFloat($(cells[3]).text().trim()),
                                                  threePM: parseInt($(cells[4]).text().trim()),
                                                  reb: parseInt($(cells[5]).text().trim()),
                                                  ast: parseInt($(cells[6]).text().trim()),
                                                  stl: parseInt($(cells[7]).text().trim()),
                                                  blk: parseInt($(cells[8]).text().trim()),
                                                  pts: parseInt($(cells[9]).text().trim()),
                                                  gp: 545 // Default - you may need to extract this from the page
                                };

                                // Only add if we have valid data
                                if (stats.name && !isNaN(stats.fgPct) && !isNaN(stats.threePM)) {
                                                  teams.push(stats);
                                                  console.log(`Added team: ${stats.name}`);
                                }
          });

          if (teams.length === 0) {
                        console.warn('No teams found - ESPN page structure may have changed');
                        return false;
          }

          // Write to JSON file
          const data = JSON.stringify(teams, null, 2);
                fs.writeFileSync('data/teams.json', data);
                console.log(`Successfully scraped ${teams.length} teams and saved to data/teams.json`);

          return true;
      } catch (error) {
                console.error('Error scraping ESPN:', error.message);
                return false;
      }
}

// Run the scraper
scrapeESPN();
