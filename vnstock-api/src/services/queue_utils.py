import json
import logging

def is_symbol_in_queue(redis_client, queue_name, symbol, job_type=None):
    """
    Checks if a job for the given symbol (and optional type) is already in the queue.
    NOTE: This is an O(N) operation. Use with caution on very large queues.
    """
    try:
        # Fetch all items in the queue
        # For very large queues, this might be slow. 
        # But generally sync queues are consumed fast or have < 10k items.
        items = redis_client.lrange(queue_name, 0, -1)
        
        for item in items:
            try:
                payload = json.loads(item)
                if payload.get('symbol') == symbol:
                    # If job_type is specified, match it. Otherwise match any job with the symbol.
                    if job_type:
                        if payload.get('type') == job_type:
                            return True
                    else:
                        return True
            except (json.JSONDecodeError, AttributeError):
                continue
                
        return False
    except Exception as e:
        logging.error(f"Error checking queue {queue_name}: {e}")
        # Default to False (safe fallback: might duplicate, but won't block)
        return False
