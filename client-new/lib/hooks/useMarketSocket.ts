import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface StockData {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    high: number;
    low: number;
    open: number;
    close: number;
}

interface VN30Index {
    index: number;
    change: number;
    changePercent: number;
}

interface MarketUpdate {
    vn30Index: VN30Index;
    stocks: StockData[];
    topGainers: StockData[];
    topLosers: StockData[];
    timestamp: string;
}

interface StockDetailUpdate {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    high: number;
    low: number;
    timestamp: string;
}

export function useMarketSocket(serverUrl: string = 'http://localhost:4000') {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [marketData, setMarketData] = useState<MarketUpdate | null>(null);

    useEffect(() => {
        // Create socket connection to /market namespace
        socketRef.current = io(`${serverUrl}/market`, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
            console.log('Connected to market socket');
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from market socket');
            setIsConnected(false);
        });

        socket.on('connect_error', (error) => {
            console.error('Market socket connection error:', error);
            setIsConnected(false);
        });

        socket.on('market:update', (data: MarketUpdate) => {
            console.log('Received market:update event:', {
                indexValue: data.vn30Index.index,
                stockCount: data.stocks.length,
                timestamp: data.timestamp
            });
            setMarketData(data);
        });

        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, [serverUrl]);

    const subscribeToMarket = () => {
        if (socketRef.current && isConnected) {
            socketRef.current.emit('subscribe:market');
        }
    };

    const unsubscribeFromMarket = () => {
        if (socketRef.current && isConnected) {
            socketRef.current.emit('unsubscribe:market');
        }
    };

    return {
        isConnected,
        marketData,
        subscribeToMarket,
        unsubscribeFromMarket
    };
}

export function useStockSocket(
    symbol: string,
    interval: number = 15000,
    serverUrl: string = 'http://localhost:4000'
) {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [stockData, setStockData] = useState<StockDetailUpdate | null>(null);

    useEffect(() => {
        // Create socket connection to /market namespace
        socketRef.current = io(`${serverUrl}/market`, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
            console.log(`Connected to stock socket for ${symbol}`);
            setIsConnected(true);

            // Auto-subscribe on connect
            if (symbol) {
                console.log(`Auto-subscribing to stock ${symbol} with interval ${interval}ms`);
                console.log(`Auto-subscribing to stock ${symbol} with interval ${interval}ms`);
                socket.emit('subscribe:stock', { symbol, interval });
            }
        });

        socket.on('disconnect', () => {
            console.log(`Disconnected from stock socket for ${symbol}`);
            setIsConnected(false);
        });

        socket.on('connect_error', (error) => {
            console.error('Stock socket connection error:', error);
            setIsConnected(false);
        });

        socket.on('stock:update', (data: StockDetailUpdate) => {
            console.log('Received stock:update event:', {
                symbol: data.symbol,
                price: data.price,
                timestamp: data.timestamp
            });
            if (data.symbol === symbol.toUpperCase()) {
                console.log(`Stock data matched for ${symbol}, updating state`);
                setStockData(data);
            } else {
                console.log(
                    `Stock data mismatch: expected ${symbol.toUpperCase()}, got ${data.symbol}`
                );
                console.log('Received stock:update event:', {
                    symbol: data.symbol,
                    price: data.price,
                    timestamp: data.timestamp
                });
                if (data.symbol === symbol.toUpperCase()) {
                    console.log(`Stock data matched for ${symbol}, updating state`);
                    setStockData(data);
                } else {
                    console.log(
                        `Stock data mismatch: expected ${symbol.toUpperCase()}, got ${data.symbol}`
                    );
                }
            }
        });

        return () => {
            if (socket) {
                socket.emit('unsubscribe:stock', { symbol });
                socket.disconnect();
            }
        };
    }, [symbol, interval, serverUrl]);

    const subscribeToStock = (newSymbol?: string, newInterval?: number) => {
        if (socketRef.current && isConnected) {
            socketRef.current.emit('subscribe:stock', {
                symbol: newSymbol || symbol,
                interval: newInterval || interval
            });
        }
    };

    const unsubscribeFromStock = (symbolToUnsubscribe?: string) => {
        if (socketRef.current && isConnected) {
            socketRef.current.emit('unsubscribe:stock', {
                symbol: symbolToUnsubscribe || symbol
            });
        }
    };

    return {
        isConnected,
        stockData,
        subscribeToStock,
        unsubscribeFromStock
    };
}
