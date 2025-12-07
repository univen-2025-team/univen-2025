
BE_API = "https://ec2-3-25-106-203.ap-southeast-2.compute.amazonaws.com:4000/v1/api"


4. [Chats](#chats)
5. [Stock Transactions](#stock-transactions)
6. [Market Cache](#market-cache)
7. [Views](#views)
8. [Error Codes](#error-codes)

## User Management

**Base Path**: `/v1/api/user`

### 1. Get User Profile

**Get authenticated user's profile information**

#### Request

```http
GET /v1/api/user/profile
Authorization: Bearer <jwt_token>
```

#### Headers

| Header          | Required | Description                     |
| --------------- | -------- | ------------------------------- |
| `Authorization` | ✅       | Bearer token for authentication |

#### Success Response (200)

```json
{
    "statusCode": 200,
    "message": "Get user profile success!",
    "metadata": {
        "_id": "69293046bcbc4ea01b8b76ce",
        "user_fullName": "Nguyễn Văn A",
        "email": "user@example.com",
        "user_email": "user@example.com",
        "user_avatar": "https://...",
        "user_gender": true,
        "user_dayOfBirth": "1990-01-01",
        "balance": 100000000,
        "user_status": "ACTIVE",
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-01-01T00:00:00.000Z"
    }
}
```

#### Error Response (401)

```json
{
    "statusCode": 401,
    "message": "Unauthorized - Token required"
}
```

## Chats

**Base Path**: `/v1/api/chats`

### 1. Get Chat Suggestions

**Get AI-powered chat suggestions based on conversation history**

#### Request

```http
POST /v1/api/chats/getChat
Content-Type: application/json
```

#### Request Body

```json
{
    "conversationId": "conv_123456",
    "userId": "69293046bcbc4ea01b8b76ce",
    "locale": "vi-VN"
}
```

#### Request Parameters

| Field            | Type   | Required | Description                    |
| ---------------- | ------ | -------- | ------------------------------ |
| `conversationId` | string | ✅       | Unique conversation identifier |
| `userId`         | string | ✅       | User ID                        |
| `locale`         | string | ❌       | Locale code (default: "vi-VN") |

#### Success Response (200)

```json
{
    "statusCode": 200,
    "message": "Get chat suggestions successfully",
    "metadata": {
        "conversationId": "conv_123456",
        "reply": "Based on your portfolio, I recommend...",
        "suggestion_messages": [
            "Show me my portfolio",
            "What stocks should I buy?",
            "Check VNM stock price"
        ],
        "raw_agent_output": {
            "reasoning": "...",
            "confidence": 0.95
        }
    }
}
```

#### Error Response (404)

```json
{
    "statusCode": 404,
    "message": "Missing required parameters (conversationId, userId)"
}
```

#### Error Response (502)

```json
{
    "statusCode": 502,
    "message": "AI service returned non-2xx status",
    "raw": "Error details from AI service"
}
```

---

## Stock Transactions

**Base Path**: `/v1/api/stock-transactions`

For detailed documentation, see: [Stock Transaction API Documentation](./stockTransaction/transaction-README.md)

### Endpoints Summary

| Endpoint                              | Method | Auth | Description                     |
| ------------------------------------- | ------ | ---- | ------------------------------- |
| `/transactions`                       | POST   | ❌   | Create a new transaction        |
| `/transactions/:userId`               | GET    | ❌   | Get transaction history         |
| `/transactions/:transactionId`        | GET    | ✅   | Get transaction by ID           |
| `/transactions/:transactionId/cancel` | PUT    | ✅   | Cancel a transaction            |
| `/transactions/:userId/stats`         | GET    | ✅   | Get user transaction statistics |
| `/ranking`                            | GET    | ❌   | Get user ranking by profit      |

---

## Market Cache

**Base Path**: `/v1/api/market`

### 1. Get Market Data

**Get latest or specific date market data**

#### Request

```http
GET /v1/api/market?date=2025-01-15
```

#### Query Parameters

| Param  | Type   | Required | Description               |
| ------ | ------ | -------- | ------------------------- |
| `date` | string | ❌       | Date in YYYY-MM-DD format |

#### Success Response (200)

```json
{
    "statusCode": 200,
    "message": "Market data retrieved successfully",
    "metadata": {
        "date": "2025-01-15",
        "vn30": {
            "index": 1250.5,
            "change": 15.2,
            "changePercent": 1.23
        },
        "stocks": [...],
        "vn30History": [
            {
                "date": "2025-01-15",
                "index": 1250.5
            }
        ],
        "isCached": true
    }
}
```

#### Error Response (404)

```json
{
    "statusCode": 404,
    "message": "No cached market data available"
}
```

---

### 2. Get Stock Data

**Get cached data for a specific stock**

#### Request

```http
GET /v1/api/market/stock/:symbol?date=2025-01-15
```

#### URL Parameters

| Param    | Type   | Required | Description  |
| -------- | ------ | -------- | ------------ |
| `symbol` | string | ✅       | Stock symbol |

#### Query Parameters

| Param  | Type   | Required | Description               |
| ------ | ------ | -------- | ------------------------- |
| `date` | string | ❌       | Date in YYYY-MM-DD format |

#### Success Response (200)

```json
{
    "statusCode": 200,
    "message": "Stock data retrieved successfully",
    "metadata": {
        "symbol": "VNM",
        "name": "Vinamilk",
        "price": 95000,
        "change": 1500,
        "changePercent": 1.6,
        "volume": 1000000,
        "date": "2025-01-15",
        "isCached": true
    }
}
```

#### Error Response (404)

```json
{
    "statusCode": 404,
    "message": "No cached data found for stock: VNM"
}
```

---

### 3. Get All Stocks

**Get all cached stocks for a specific date**

#### Request

```http
GET /v1/api/market/stocks?date=2025-01-15
```

#### Query Parameters

| Param  | Type   | Required | Description               |
| ------ | ------ | -------- | ------------------------- |
| `date` | string | ❌       | Date in YYYY-MM-DD format |

#### Success Response (200)

```json
{
    "statusCode": 200,
    "message": "All stocks retrieved successfully",
    "metadata": {
        "date": "2025-01-15",
        "stocks": [
            {
                "symbol": "VNM",
                "name": "Vinamilk",
                "price": 95000,
                "change": 1500,
                "changePercent": 1.6
            },
            ...
        ],
        "total": 500,
        "isCached": true
    }
}
```

---

### 4. Get Available Dates

**Get list of available cached dates**

#### Request

```http
GET /v1/api/market/dates
```

#### Success Response (200)

```json
{
    "statusCode": 200,
    "message": "Available dates retrieved successfully",
    "metadata": {
        "dates": ["2025-01-15", "2025-01-14", "2025-01-13"],
        "latest": "2025-01-15",
        "oldest": "2025-01-01"
    }
}
```

---

### 5. Get VN30 History

**Get VN30 index history**

#### Request

```http
GET /v1/api/market/history/vn30?days=30
```

#### Query Parameters

| Param  | Type   | Required | Description                  |
| ------ | ------ | -------- | ---------------------------- |
| `days` | number | ❌       | Number of days (default: 30) |

#### Success Response (200)

```json
{
    "statusCode": 200,
    "message": "VN30 history retrieved successfully",
    "metadata": {
        "history": [
            {
                "date": "2025-01-15",
                "index": 1250.5,
                "change": 15.2,
                "changePercent": 1.23
            },
            ...
        ],
        "period": 30
    }
}
```

---

## Views

**Base Path**: `/v1/api/views` or `/`

### 1. Home Page

**Render home page view**

#### Request

```http
GET /v1/api/views/
```

or

```http
GET /
```

#### Success Response (200)

Returns HTML page rendered by Handlebars template engine.

---

## Error Codes

### Common HTTP Status Codes

| Code    | Message               | Cause                                                    |
| ------- | --------------------- | -------------------------------------------------------- |
| **200** | OK                    | Request successful                                       |
| **201** | Created               | Resource created successfully                            |
| **400** | Bad Request           | Invalid input, validation error, or business logic error |
| **401** | Unauthorized          | Missing or invalid authentication token                  |
| **403** | Forbidden             | User lacks permission to perform this action             |
| **404** | Not Found             | Resource not found                                       |
| **500** | Internal Server Error | Server-side error                                        |
| **502** | Bad Gateway           | External service (e.g., AI service) unavailable          |

### Error Response Format

All error responses follow this format:

```json
{
    "statusCode": 400,
    "message": "Error message describing what went wrong"
}
```

### Common Error Messages

| Message | Status | Solution |
| --- | --- | --- |
| `Unauthorized - Token required` | 401 | Include valid JWT in Authorization header |
| `Invalid or expired refresh token` | 401 | Request new token pair |
| `User not found` | 404 | Verify user exists in system |
| `Validation error: ...` | 400 | Check request body format and validation |
| `Missing required parameters (...)` | 404 | Include all required parameters in request |
| `Insufficient balance. Required: X, Available: Y` | 400 | Add more balance to account |

---

## Authentication Flow

### Standard Authentication

1. **Sign Up** or **Login** to receive `accessToken` and `refreshToken`
2. Include `accessToken` in `Authorization` header for protected endpoints
3. When `accessToken` expires, use **Get New Token Pair** endpoint with `refreshToken`
4. Use **Logout** to invalidate tokens

### Google OAuth Flow

1. User visits `/v1/api/auth/login/google`
2. Redirected to Google OAuth consent screen
3. After consent, redirected to `/v1/api/auth/login/google/callback`
4. Server processes authentication and redirects to client with tokens

### OTP Authentication Flow

1. User requests OTP via **Send OTP** endpoint
2. User receives OTP code via email
3. User verifies OTP via **Verify OTP** endpoint
4. User receives `accessToken` and `refreshToken` upon successful verification

---

## Request/Response Summary Table

| Endpoint | Method | Auth | Params | Query | Body | Returns |
| --- | --- | --- | --- | --- | --- | --- |
| `/auth/sign-up` | POST | ❌ | - | - | ✅ | User + Tokens |
| `/auth/login` | POST | ❌ | - | - | ✅ | User + Tokens |
| `/auth/login/google` | GET | ❌ | - | - | - | Redirect |
| `/auth/login/google/callback` | GET | ❌ | - | - | - | Redirect + Tokens |
| `/auth/new-token` | POST | ❌ | - | - | ✅ | Tokens |
| `/auth/logout` | POST | ✅ | - | - | - | Success message |
| `/auth/forgot-password` | PATCH | ✅ | - | - | ✅ | Success message |
| `/otp/send` | POST | ❌ | - | - | ✅ | Success message |
| `/otp/verify` | POST | ❌ | - | - | ✅ | User + Tokens |
| `/user/profile` | GET | ✅ | - | - | - | User profile |
| `/user/profile` | PATCH | ✅ | - | - | ✅ | Updated user profile |
| `/user/upload-avatar` | POST | ✅ | - | - | ✅ | Updated user profile |
| `/chats/getChat` | POST | ❌ | - | - | ✅ | Chat suggestions |
| `/stock-transactions/transactions` | POST | ❌ | - | - | ✅ | Transaction |
| `/stock-transactions/transactions/:userId` | GET | ❌ | userId | ✅ | - | Transactions[] |
| `/stock-transactions/transactions/:id` | GET | ✅ | transactionId | - | - | Transaction |
| `/stock-transactions/transactions/:id/cancel` | PUT | ✅ | transactionId | - | ✅ | Transaction |
| `/stock-transactions/transactions/:userId/stats` | GET | ✅ | userId | - | - | Stats |
| `/stock-transactions/ranking` | GET | ❌ | - | ✅ | - | Ranking[] |
| `/market` | GET | ❌ | - | ✅ | - | Market data |
| `/market/stock/:symbol` | GET | ❌ | symbol | ✅ | - | Stock data |
| `/market/stocks` | GET | ❌ | - | ✅ | - | Stocks[] |
| `/market/dates` | GET | ❌ | - | - | - | Dates[] |
| `/market/history/vn30` | GET | ❌ | - | ✅ | - | VN30 history |
| `/views/` | GET | ❌ | - | - | - | HTML page |

---

## Notes

-   **Authentication**: Endpoints requiring auth use JWT Bearer tokens in `Authorization` header
-   **Validation**: All request payloads are validated using Zod schemas
-   **Timestamps**: All dates in ISO 8601 format (UTC)
-   **Currency**: All monetary values in VND (Vietnamese Dong)
-   **Pagination**: Default limit is 10, max is 100 records per page (where applicable)
-   **Error Handling**: All errors follow consistent format with `statusCode` and `message`
-   **Caching**: Market data endpoints return cached data from MongoDB
-   **File Uploads**: Avatar uploads use multipart/form-data with field name `avatar`

---

## Support

For issues or questions:

1. Check error response message for details
2. Verify request format matches documentation
3. Ensure authentication token is valid (for protected endpoints)
4. Review server logs for additional debugging information
5. Check validation schemas in `server/src/api/validations/zod/` for detailed field requirements
