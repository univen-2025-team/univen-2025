from pydantic import BaseModel, Field
from typing import Optional

class CompanyProfileDTO(BaseModel):
    """
    Data Transfer Object for Company Profile.
    """
    ticker: str = Field(..., alias="ticker")
    exchange: Optional[str] = Field(None, alias="exchange")
    industry: Optional[str] = Field(None, alias="industry")
    company_type: Optional[str] = Field(None, alias="companyType")
    established_year: Optional[str] = Field(None, alias="establishedYear")
    no_employees: Optional[int] = Field(None, alias="noEmployees")
    foreign_percent: Optional[float] = Field(None, alias="foreignPercent")
    website: Optional[str] = Field(None, alias="website")
    stock_rating: Optional[float] = Field(None, alias="stockRating")
    delta_in_week: Optional[float] = Field(None, alias="deltaInWeek")
    delta_in_month: Optional[float] = Field(None, alias="deltaInMonth")
    delta_in_year: Optional[float] = Field(None, alias="deltaInYear")
    outstanding_share: Optional[float] = Field(None, alias="outstandingShare")
    issue_share: Optional[float] = Field(None, alias="issueShare")
    company_name: Optional[str] = Field(None, alias="companyName")
    company_short_name: Optional[str] = Field(None, alias="companyShortName")
    logo: Optional[str] = Field(None, alias="logo")
    
    class Config:
        extra = "allow"
        populate_by_name = True
