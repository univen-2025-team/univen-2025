
const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://univenadmin:7anDtT3SJNX2zgDj@cluster0.qhpwdw3.mongodb.net/univen2025?appName=Cluster0";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const database = client.db('univen2025');
    const symbol = 'VPB';

    console.log(`Checking data for ${symbol}...`);

    const profile = await database.collection('company_profiles').findOne({ ticker: symbol });
    console.log('Profile:', profile ? 'Found' : 'Not Found');
    if(profile) console.log(JSON.stringify(profile, null, 2));

    const symbolInfo = await database.collection('stock_symbols').findOne({ symbol: symbol });
    console.log('Symbol Info:', symbolInfo ? 'Found' : 'Not Found');

    const history = await database.collection('stock_histories').findOne({ symbol: symbol }); // Just check if any history exists
    console.log('History (any):', history ? 'Found' : 'Not Found');
    
    // Check latest history
    const latestHistory = await database.collection('stock_histories').find({ symbol: symbol }).sort({ date: -1 }).limit(1).toArray();
    console.log('Latest History:', latestHistory.length > 0 ? latestHistory[0].date : 'None');

  } finally {
    await client.close();
  }
}
run().catch(console.dir);
