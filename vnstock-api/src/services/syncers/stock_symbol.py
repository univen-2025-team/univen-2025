from src.services.syncers.base import BaseSyncer
from src.database.mongodb import db
from src.models.stock_symbol import StockSymbolDTO
from typing import List, Dict, Any
from datetime import datetime
from pymongo import UpdateOne

class StockSymbolSyncer(BaseSyncer):
    def __init__(self):
        self.collection = db.get_database()["stock_symbols"]

    def sync(self, data: List[Dict[str, Any]]) -> None:
        """
        Sync stock symbol data to MongoDB.
        Uses bulk write for efficiency.
        """
        if not data:
            return

        try:
            operations = []
            timestamp = datetime.utcnow()
            
            for item in data:
                # Map snake_case source keys to camelCase aliases via DTO
                
                try:
                   dto = StockSymbolDTO(**item)
                   document = dto.model_dump(by_alias=True)
                   document['updated_at'] = timestamp
                   
                   operations.append(
                       UpdateOne(
                           {"symbol": dto.symbol},
                           {"$set": document},
                           upsert=True
                       )
                   )
                except Exception as e:
                    print(f"Skipping item {item.get('symbol', 'unknown')} due to error: {e}")
                    continue

            if operations:
                result = self.collection.bulk_write(operations)
                print(f"Synced Stock Symbols: Matched {result.matched_count}, Modified {result.modified_count}, Upserted {result.upserted_count}")
            
        except Exception as e:
            print(f"Error syncing stock symbol data: {e}")
