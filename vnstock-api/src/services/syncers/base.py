from abc import ABC, abstractmethod
from typing import Any

class BaseSyncer(ABC):
    """
    Abstract base class for data syncers.
    """
    
    @abstractmethod
    def sync(self, data: Any) -> None:
        """
        Sync the provided data to the database.
        
        Args:
            data: The data to be synced.
        """
        pass
