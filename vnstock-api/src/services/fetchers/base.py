from abc import ABC, abstractmethod
from typing import Any

class BaseFetcher(ABC):
    """
    Abstract base class for data fetchers.
    """
    
    @abstractmethod
    def fetch(self) -> Any:
        """
        Fetch data from the source.
        Returns the fetched data.
        """
        pass
