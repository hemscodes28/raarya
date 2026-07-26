import https from 'https';

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function checkLiveRaarya() {
  console.log('Fetching live home page of raarya.com...');
  try {
    const html = await fetchPage('https://www.raarya.com/');
    console.log('Homepage fetched successfully.');
    
    // Count property links on homepage or section links
    const matches = html.match(/properties-views/g) || [];
    console.log(`Found ${matches.length} property link occurrences on homepage.`);

    // Check pagination or total listings if visible in HTML
    const buyPage = await fetchPage('https://www.raarya.com/properties/buy');
    const buyMatches = buyPage.match(/properties-views\/[^\/]+\/(\d+)/g) || [];
    console.log(`Buy page fetched, found property links sample: ${buyMatches.slice(0, 5).join(', ')}`);
  } catch (err) {
    console.error('Error fetching raarya.com:', err.message);
  }
}

checkLiveRaarya();
