/**
 * Test script to verify VNStock service integration
 * Run with: cd server && npx tsx test-vnstock.ts
 */

import VNStockService from './src/api/services/vnstock.service.js';

async function testVNStock() {
    console.log('Testing VNStock Service...\n');
    
    const vnstockService = VNStockService.getInstance();
    
    // Wait a bit for initialization
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Service initialized:', vnstockService.isInitialized());
    
    if (!vnstockService.isInitialized()) {
        console.error('VNStock service failed to initialize');
        return;
    }
    
    // Test fetching stock data
    console.log('\n--- Testing Stock Data Fetch ---');
    const testSymbols = ['VCB', 'VHM', 'HPG'];
    
    for (const symbol of testSymbols) {
        console.log(`\nFetching ${symbol}...`);
        const stockData = await vnstockService.getStockPrice(symbol);
        
        if (stockData) {
            console.log('✓ Success:');
            console.log(`  Symbol: ${stockData.symbol}`);
            console.log(`  Price: ${stockData.price.toLocaleString('vi-VN')} VND`);
            console.log(`  Change: ${stockData.change > 0 ? '+' : ''}${stockData.change.toLocaleString('vi-VN')} (${stockData.changePercent}%)`);
            console.log(`  Volume: ${stockData.volume.toLocaleString('vi-VN')}`);
            console.log(`  High: ${stockData.high.toLocaleString('vi-VN')}`);
            console.log(`  Low: ${stockData.low.toLocaleString('vi-VN')}`);
        } else {
            console.log('✗ Failed to fetch data');
        }
    }
    
    // Test fetching VN30 index
    console.log('\n--- Testing VN30 Index Fetch ---');
    const vn30Data = await vnstockService.getVN30Index();
    
    if (vn30Data) {
        console.log('✓ Success:');
        console.log(`  Index: ${vn30Data.index.toFixed(2)}`);
        console.log(`  Change: ${vn30Data.change > 0 ? '+' : ''}${vn30Data.change.toFixed(2)} (${vn30Data.changePercent}%)`);
    } else {
        console.log('✗ Failed to fetch VN30 index');
    }
    
    console.log('\nTest completed!');
}

testVNStock().catch(console.error);
