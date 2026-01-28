
import mongoose from 'mongoose';
import { format, subDays } from 'date-fns';

const DB_URL = 'mongodb+srv://univenadmin:7anDtT3SJNX2zgDj@cluster0.qhpwdw3.mongodb.net/test?appName=Cluster0';

const stockHistorySchema = new mongoose.Schema({
    symbol: { type: String, required: true },
    date: { type: String, required: true }, // Format YYYY-MM-DD
    interval: { type: String, required: true },
    prices: { type: Array, default: [] },
    updated_at: { type: Date, default: Date.now }
}, { collection: 'stock_history' });

const StockHistoryModel = mongoose.model('StockHistory', stockHistorySchema);

async function checkData() {
    try {
        await mongoose.connect(DB_URL);
        console.log('Connected to DB');

        const today = new Date();
        const targetDate = subDays(today, 3); // 1 = Mon -> -3 = Fri (approx)

        // Let's just recalculate based on logic
        // If today is Monday (1), target is Fri (-3)
        // Today 2026-01-19. Friday was 2026-01-16.
        const targetStr = '2026-01-16';

        console.log(`Checking data for VIC on ${targetStr}...`);

        const doc = await StockHistoryModel.findOne({
            symbol: 'VIC',
            date: targetStr,
            interval: '1m'
        }).lean();

        if (doc) {
            console.log(`FOUND Data for ${targetStr}:`, {
                symbol: doc.symbol,
                pricesCount: doc.prices?.length,
                firstPrice: doc.prices?.[0]?.time,
                lastPrice: doc.prices?.[doc.prices.length - 1]?.time
            });
        } else {
            console.log(`NO Data found for ${targetStr}`);

            // Check nearby dates
            const nearby = await StockHistoryModel.find({ symbol: 'VIC', interval: '1m' })
                .sort({ date: -1 })
                .limit(5)
                .select('date')
                .lean();
            console.log('Available dates for VIC:', nearby.map(d => d.date));
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

checkData();
