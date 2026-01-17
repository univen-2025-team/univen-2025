from pydantic import BaseModel, Field
from typing import Optional

class StockSymbolDTO(BaseModel):
    """
    Data Transfer Object for Stock Symbol (symbols_by_exchange).
    """
    symbol: str = Field(..., alias="symbol")
    # id field is not returned by API, likely index in user's DF
    type: str = Field(..., alias="type")
    exchange: str = Field(..., alias="exchange")
    en_organ_name: Optional[str] = Field(None, alias="enOrganName")
    en_organ_short_name: Optional[str] = Field(None, alias="enOrganShortName")
    organ_short_name: Optional[str] = Field(None, alias="organShortName")
    organ_name: Optional[str] = Field(None, alias="organName")
    
    # Extra fields found in API
    icb_code2: Optional[str] = Field(None, alias="icbCode2")
    product_grp_id: Optional[str] = Field(None, alias="productGrpId")
    
    class Config:
        extra = "allow"
        populate_by_name = True
