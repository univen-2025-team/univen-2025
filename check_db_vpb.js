
const { MongoClient } = require('mongodb');

// URI from server/.env.development or production config
const uri = "mongodb+srv://univenadmin:7anDtT3SJNX2zgDj@cluster0.qhpwdw3.mongodb.net/1111venture?appName=Cluster0";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB...");
    const database = client.db('univen2025');
    const symbol = 'SSB';

    console.log(`--- Checking Data for ${symbol} ---`);

    // 1. Check Profile
    const profile = await database.collection('company_profiles').findOne({ ticker: symbol });
    console.log('1. Company Profile:', profile ? '✅ Found' : '❌ Not Found');
    if (profile) console.log('   - ID:', profile._id);

    // 2. Check Symbol Info
    const symbolInfo = await database.collection('stock_symbols').findOne({ symbol: symbol });
    console.log('2. Stock Symbol:', symbolInfo ? '✅ Found' : '❌ Not Found');
    
    // 3. Check History (Latest)
    const historyCursor = database.collection('stock_histories').find({ symbol: symbol }).sort({ date: -1 }).limit(1);
    const history = await historyCursor.toArray();
    console.log('3. Stock History:', history.length > 0 ? `✅ Found (Latest: ${history[0].date})` : '❌ Not Found');
    
    if (history.length > 0) {
       console.log('   - Prices Count:', history[0].prices ? history[0].prices.length : 0);
    }

  } catch (e) {
      console.error("Error:", e);
  } finally {
    await client.close();
  }
}
run();
