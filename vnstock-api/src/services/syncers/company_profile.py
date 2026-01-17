from src.services.syncers.base import BaseSyncer
from src.database.mongodb import db
from src.models.company_profile import CompanyProfileDTO
from typing import Dict, Any
from datetime import datetime

class CompanyProfileSyncer(BaseSyncer):
    def __init__(self):
        self.collection = db.get_database()["company_profiles"]

    def sync(self, data: Dict[str, Any]) -> None:
        """
        Sync company profile data to MongoDB.
        upserts based on 'ticker'.
        """
        if not data:
            return

        try:
            # Validate input data with DTO (optional for schema-less, but good for validation)
            dto = CompanyProfileDTO(**data)
            document = dto.model_dump(by_alias=True)
            
            # Add metadata
            document['updated_at'] = datetime.utcnow()
            
            # Upsert into MongoDB
            self.collection.update_one(
                {"ticker": dto.ticker},
                {"$set": document},
                upsert=True
            )
            print(f"Synced profile for {dto.ticker}")
            
        except Exception as e:
            print(f"Error syncing profile data: {e}")
