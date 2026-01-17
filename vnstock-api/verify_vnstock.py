from vnstock import Listing

try:
    print("Initializing Listing client...")
    # Initialize Listing with source="VCI" (case insensitive usually, but VCI is explicit)
    lst = Listing(source="VCI", show_log=False)
    
    print("Fetching all symbols...")
    df = lst.all_symbols()
    
    if not df.empty:
        print(f"Successfully fetched {len(df)} companies.")
        print(df.head())
    else:
        print("Fetched data is empty.")

except Exception as e:
    print(f"Error: {e}")
