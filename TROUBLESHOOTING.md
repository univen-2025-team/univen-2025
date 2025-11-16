# Troubleshooting Guide: Python VNStock Server

This guide helps diagnose and resolve issues with the Python VNStock server integration.

## Quick Diagnosis

### Check if Python Server is Running

```bash
curl http://localhost:5000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00"
}
```

### Check Server Logs

```bash
# If using start-all.sh
tail -f logs/python-server.log

# If running manually
cd python-server
tail -f *.log
```

## Common Issues and Solutions

### Issue 1: "Python vnstock server is not available" Error

**Symptoms:**
- Market data fails to load in the UI
- 503 Service Unavailable errors
- Error message: "Unable to fetch real market data. Please ensure the Python server is running."

**Diagnosis:**
1. Check if Python server is running:
   ```bash
   curl http://localhost:5000/health
   ```
   
2. Check if the port is in use:
   ```bash
   lsof -i:5000
   ```

**Solutions:**

#### Solution A: Start the Python Server

```bash
cd python-server
./start.sh
```

Or manually:
```bash
cd python-server
source venv/bin/activate
python app.py
```

#### Solution B: Check Environment Configuration

1. Verify `.env` file exists in `python-server/`:
   ```bash
   cd python-server
   ls -la .env
   ```

2. If missing, create from example:
   ```bash
   cp .env.example .env
   ```

3. Verify the content:
   ```bash
   cat .env
   ```

   Should contain:
   ```
   FLASK_PORT=5000
   FLASK_HOST=0.0.0.0
   FLASK_ENV=development
   CORS_ORIGINS=http://localhost:3000,http://localhost:4000
   VNSTOCK_SOURCE=TCBS
   ```

#### Solution C: Fix Python Dependencies

```bash
cd python-server
source venv/bin/activate
pip install --upgrade -r requirements.txt
```

### Issue 2: 403 Forbidden Errors from VNStock

**Symptoms:**
- Server logs show: "Failed to fetch data: 403 - Forbidden"
- No stock data returned

**Cause:**
Using VCI data source without authentication credentials.

**Solution:**

1. Edit `python-server/.env`:
   ```bash
   cd python-server
   nano .env
   ```

2. Ensure `VNSTOCK_SOURCE=TCBS`:
   ```
   VNSTOCK_SOURCE=TCBS
   ```

3. Restart the server:
   ```bash
   # Stop current server (Ctrl+C)
   python app.py
   ```

**Note:** TCBS is the free, no-authentication-required source. VCI and MSN may require API keys.

### Issue 3: Module Import Errors

**Symptoms:**
```
ModuleNotFoundError: No module named 'vnstock3'
ModuleNotFoundError: No module named 'flask'
```

**Solution:**

```bash
cd python-server

# Create virtual environment if it doesn't exist
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Verify installation
pip list | grep vnstock
pip list | grep flask
```

### Issue 4: Port Already in Use

**Symptoms:**
```
OSError: [Errno 48] Address already in use
```

**Solution:**

1. Find the process using port 5000:
   ```bash
   lsof -i:5000
   ```

2. Kill the process:
   ```bash
   kill -9 <PID>
   ```

3. Or change the port in `.env`:
   ```
   FLASK_PORT=5001
   ```

   And update `server/.env`:
   ```
   VNSTOCK_API_URL=http://localhost:5001
   ```

### Issue 5: CORS Errors in Browser

**Symptoms:**
- Browser console shows CORS errors
- Network tab shows failed preflight requests

**Solution:**

1. Check `python-server/.env` CORS configuration:
   ```
   CORS_ORIGINS=http://localhost:3000,http://localhost:4000
   ```

2. Add your frontend URL if different:
   ```
   CORS_ORIGINS=http://localhost:3000,http://localhost:4000,http://your-domain.com
   ```

3. Restart the Python server

### Issue 6: Connection Timeout Errors

**Symptoms:**
- Requests to Python server timeout
- Error: "AbortError: The operation was aborted"

**Diagnosis:**
1. Check server response time:
   ```bash
   time curl http://localhost:5000/api/market
   ```

2. Check server logs for slow queries

**Solutions:**

#### Solution A: Increase Timeout
Edit `server/src/api/services/vnstock.service.ts`:
```typescript
signal: AbortSignal.timeout(30000), // Increase from 10000ms to 30000ms
```

#### Solution B: Optimize Data Fetching
The Python server fetches data for all 30 VN30 stocks. Consider:
- Reducing the limit parameter
- Implementing caching
- Using a background job for data updates

### Issue 7: NestJS Server Not Connecting to Python Server

**Symptoms:**
- NestJS logs show: "Failed to connect to Python vnstock server"
- Market socket service falls back to mock data

**Diagnosis:**
```bash
# From NestJS server directory
cat .env | grep VNSTOCK_API_URL
```

**Solution:**

1. Verify `server/.env` contains:
   ```
   VNSTOCK_API_URL=http://localhost:5000
   ```

2. Restart the NestJS server

3. Test connection manually:
   ```bash
   curl http://localhost:4000/health
   curl http://localhost:5000/health
   ```

### Issue 8: Next.js API Route Returns 503

**Symptoms:**
- Frontend calls to `/api/market` return 503
- Error: "Python vnstock server is not available"

**Diagnosis:**
```bash
# Check Next.js environment
cd client-new
cat .env.local
```

**Solution:**

1. Create or update `client-new/.env.local`:
   ```
   PYTHON_SERVER_URL=http://localhost:5000
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

2. Restart Next.js:
   ```bash
   cd client-new
   npm run dev
   ```

## Health Check Checklist

Use this checklist to verify all services are properly configured:

- [ ] Python server is running on port 5000
- [ ] Python server `/health` endpoint responds with 200 OK
- [ ] Python server can fetch data: `curl http://localhost:5000/api/market`
- [ ] `python-server/.env` exists with `VNSTOCK_SOURCE=TCBS`
- [ ] NestJS server is running on port 4000
- [ ] `server/.env` contains `VNSTOCK_API_URL=http://localhost:5000`
- [ ] Next.js is running on port 3000
- [ ] `client-new/.env.local` contains `PYTHON_SERVER_URL=http://localhost:5000`
- [ ] No CORS errors in browser console
- [ ] Market data loads in UI

## Testing the Complete Flow

### 1. Test Python Server Directly
```bash
curl -v http://localhost:5000/api/market?sortBy=price&order=desc&limit=5
```

Expected: JSON response with stock data

### 2. Test NestJS Server Integration
```bash
# The NestJS server uses Socket.IO, so test the health endpoint
curl http://localhost:4000/health
```

### 3. Test Next.js API Route
```bash
curl http://localhost:3000/api/market?sortBy=price&order=desc&limit=5
```

Expected: JSON response proxied from Python server

### 4. Test in Browser
1. Open http://localhost:3000/market
2. Open browser DevTools (F12)
3. Check Network tab for API calls
4. Check Console for any errors

## Performance Optimization

If the server is slow:

1. **Enable Response Caching** (in Python server):
   ```python
   # Add caching to reduce API calls
   from functools import lru_cache
   
   @lru_cache(maxsize=1)
   def get_cached_market_data():
       return get_market_data()
   ```

2. **Reduce Data Fetching Frequency**:
   - Adjust Socket.IO update interval in NestJS
   - Use longer cache TTL values

3. **Use Database Caching**:
   - Store historical data in MongoDB
   - Only fetch fresh data periodically

## Getting Help

If issues persist:

1. Check logs from all three services:
   ```bash
   tail -f logs/python-server.log
   tail -f logs/nestjs-server.log
   tail -f logs/nextjs-frontend.log
   ```

2. Enable debug logging in Python server:
   ```
   FLASK_ENV=development
   ```

3. Check vnstock library version:
   ```bash
   cd python-server
   source venv/bin/activate
   pip show vnstock3
   ```

4. Try using a different data source:
   ```
   VNSTOCK_SOURCE=MSN
   ```

## References

- [vnstock3 Documentation](https://github.com/thinh-vu/vnstock)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
