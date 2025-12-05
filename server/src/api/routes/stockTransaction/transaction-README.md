    # Stock Transaction API Documentation

## Overview

API endpoints for managing stock transactions (BUY/SELL operations). Handles transaction creation, history retrieval, cancellation, and statistics.

**Base URL**: `/v1/api/stock-transactions`

---

## Table of Contents

1. [Create Transaction](#1-create-transaction)
2. [Get Transaction History](#2-get-transaction-history)
3. [Get Transaction by ID](#3-get-transaction-by-id)
4. [Cancel Transaction](#4-cancel-transaction)
5. [Get User Transaction Stats](#5-get-user-transaction-stats)
6. [Get User Ranking](#6-get-user-ranking)
7. [Error Codes](#error-codes)
8. [Data Models](#data-models)

---

## 1. Create Transaction

**Create a new stock transaction (BUY or SELL)**

### Request

```http
POST /v1/api/stock-transactions/transactions
Content-Type: application/json
```

### Request Body

```json
{
    "stock_code": "VNM",
    "stock_name": "Vinamilk",
    "quantity": 10,
    "price_per_unit": 95000,
    "transaction_type": "BUY"
}
```

### Request Parameters

| Field              | Type   | Required | Validation      | Description                        |
| ------------------ | ------ | -------- | --------------- | ---------------------------------- |
| `stock_code`       | string | ✅       | 1-10 chars      | Stock symbol (VNM, VCB, TCB, etc.) |
| `stock_name`       | string | ✅       | 1-255 chars     | Full stock name                    |
| `quantity`         | number | ✅       | > 0             | Number of shares to buy/sell       |
| `price_per_unit`   | number | ✅       | ≥ 0             | Price per share (VND)              |
| `transaction_type` | string | ✅       | "BUY" \| "SELL" | Transaction type                   |

### Success Response (200)

```json
{
    "statusCode": 200,
    "message": "Transaction created successfully",
    "metadata": {
        "transaction_id": "67456a8c9d2e1f5a3b8c0d1e",
        "stock_code": "VNM",
        "stock_name": "Vinamilk",
        "quantity": 10,
        "price_per_unit": 95000,
        "total_amount": 950000,
        "transaction_type": "BUY",
        "balance_before": 100000000,
        "balance_after": 99050000,
        "executed_at": "2025-11-28T10:30:00.000Z"
    }
}
```

### Error Responses

**400 - Insufficient Balance**

```json
{
    "statusCode": 400,
    "message": "Insufficient balance. Required: 950000, Available: 500000"
}
```

**400 - Invalid Input**

```json
{
    "statusCode": 400,
    "message": "Quantity must be greater than 0"
}
```

**400 - User Not Found**

```json
{
    "statusCode": 400,
    "message": "User not found"
}
```

### Calculation Logic

-   **Total Amount** = quantity × price_per_unit
-   **For BUY**: balance_after = balance_before - total_amount
-   **For SELL**: balance_after = balance_before + total_amount

### Example cURL

```bash
curl -X POST http://localhost:4000/v1/api/stock-transactions/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "stock_code": "VNM",
    "stock_name": "Vinamilk",
    "quantity": 10,
    "price_per_unit": 95000,
    "transaction_type": "BUY"
  }'
```

---

## 2. Get Transaction History

**Retrieve user's transaction history with filters and pagination**

### Request

```http
GET /v1/api/stock-transactions/transactions/:userId?transaction_type=BUY&stock_code=VNM&status=COMPLETED&page=1&limit=10
```

### URL Parameters

| Param    | Type   | Required | Description     |
| -------- | ------ | -------- | --------------- |
| `userId` | string | ✅       | MongoDB User ID |

### Query Parameters

| Param | Type | Default | Options | Description |
| --- | --- | --- | --- | --- |
| `transaction_type` | string | - | "BUY", "SELL" | Filter by transaction type |
| `stock_code` | string | - | - | Filter by stock code |
| `status` | string | - | "PENDING", "COMPLETED", "CANCELLED", "FAILED" | Filter by status |
| `page` | number | 1 | ≥ 1 | Page number for pagination |
| `limit` | number | 10 | 1-100 | Records per page |

### Success Response (200)

```json
{
    "statusCode": 200,
    "message": "Get transaction history successfully",
    "metadata": {
        "transactions": [
            {
                "_id": "67456a8c9d2e1f5a3b8c0d1e",
                "user_id": "69293046bcbc4ea01b8b76ce",
                "stock_code": "VNM",
                "stock_name": "Vinamilk",
                "quantity": 10,
                "price_per_unit": 95000,
                "total_amount": 950000,
                "transaction_type": "BUY",
                "transaction_status": "COMPLETED",
                "balance_before": 100000000,
                "balance_after": 99050000,
                "createdAt": "2025-11-28T10:30:00.000Z",
                "updatedAt": "2025-11-28T10:30:00.000Z"
            },
            {
                "_id": "67456a8c9d2e1f5a3b8c0d1f",
                "user_id": "69293046bcbc4ea01b8b76ce",
                "stock_code": "VCB",
                "stock_name": "Vietcombank",
                "quantity": 5,
                "price_per_unit": 80000,
                "total_amount": 400000,
                "transaction_type": "BUY",
                "transaction_status": "COMPLETED",
                "balance_before": 99050000,
                "balance_after": 98650000,
                "createdAt": "2025-11-28T11:00:00.000Z",
                "updatedAt": "2025-11-28T11:00:00.000Z"
            }
        ],
        "pagination": {
            "page": 1,
            "limit": 10,
            "total": 12,
            "totalPages": 2
        }
    }
}
```

### Error Response (400)

```json
{
    "statusCode": 400,
    "message": "Invalid pagination parameters"
}
```

### Example Requests

**Get all BUY transactions**

```bash
curl "http://localhost:4000/v1/api/stock-transactions/transactions/69293046bcbc4ea01b8b76ce?transaction_type=BUY"
```

**Get VNM stock transactions, page 2, 5 records per page**

```bash
curl "http://localhost:4000/v1/api/stock-transactions/transactions/69293046bcbc4ea01b8b76ce?stock_code=VNM&page=2&limit=5"
```

**Get completed transactions**

```bash
curl "http://localhost:4000/v1/api/stock-transactions/transactions/69293046bcbc4ea01b8b76ce?status=COMPLETED"
```

---

## 3. Get Transaction by ID

**Retrieve a specific transaction by ID (requires authentication)**

### Request

```http
GET /v1/api/stock-transactions/transactions/:transactionId
Authorization: Bearer <jwt_token>
```

### URL Parameters

| Param           | Type   | Required | Description            |
| --------------- | ------ | -------- | ---------------------- |
| `transactionId` | string | ✅       | MongoDB Transaction ID |

### Headers

| Header          | Required | Description                     |
| --------------- | -------- | ------------------------------- |
| `Authorization` | ✅       | Bearer token for authentication |

### Success Response (200)

```json
{
    "statusCode": 200,
    "message": "Get transaction successfully",
    "metadata": {
        "_id": "67456a8c9d2e1f5a3b8c0d1e",
        "user_id": "69293046bcbc4ea01b8b76ce",
        "stock_code": "VNM",
        "stock_name": "Vinamilk",
        "quantity": 10,
        "price_per_unit": 95000,
        "total_amount": 950000,
        "transaction_type": "BUY",
        "transaction_status": "COMPLETED",
        "balance_before": 100000000,
        "balance_after": 99050000,
        "createdAt": "2025-11-28T10:30:00.000Z",
        "updatedAt": "2025-11-28T10:30:00.000Z"
    }
}
```

### Error Response (404)

```json
{
    "statusCode": 404,
    "message": "Transaction not found"
}
```

### Error Response (403)

```json
{
    "statusCode": 403,
    "message": "You do not have permission to view this transaction"
}
```

### Error Response (401)

```json
{
    "statusCode": 401,
    "message": "Unauthorized - Token required"
}
```

### Example cURL

```bash
curl -X GET http://localhost:4000/v1/api/stock-transactions/transactions/67456a8c9d2e1f5a3b8c0d1e \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 4. Cancel Transaction

**Cancel an existing transaction and refund balance (requires authentication)**

### Request

```http
PUT /v1/api/stock-transactions/transactions/:transactionId/cancel
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

### URL Parameters

| Param           | Type   | Required | Description            |
| --------------- | ------ | -------- | ---------------------- |
| `transactionId` | string | ✅       | MongoDB Transaction ID |

### Request Body

```json
{
    "reason": "Changed my mind"
}
```

| Field    | Type   | Required | Description                    |
| -------- | ------ | -------- | ------------------------------ |
| `reason` | string | ❌       | Cancellation reason (optional) |

### Headers

| Header          | Required | Description                     |
| --------------- | -------- | ------------------------------- |
| `Authorization` | ✅       | Bearer token for authentication |

### Success Response (200)

```json
{
    "statusCode": 200,
    "message": "Transaction cancelled successfully",
    "metadata": {
        "_id": "67456a8c9d2e1f5a3b8c0d1e",
        "user_id": "69293046bcbc4ea01b8b76ce",
        "stock_code": "VNM",
        "stock_name": "Vinamilk",
        "quantity": 10,
        "price_per_unit": 95000,
        "total_amount": 950000,
        "transaction_type": "BUY",
        "transaction_status": "CANCELLED",
        "balance_before": 100000000,
        "balance_after": 100000000,
        "cancellation_reason": "Changed my mind",
        "cancelled_at": "2025-11-28T10:35:00.000Z",
        "createdAt": "2025-11-28T10:30:00.000Z",
        "updatedAt": "2025-11-28T10:35:00.000Z"
    }
}
```

### Error Response (400)

```json
{
    "statusCode": 400,
    "message": "Cannot cancel transaction with status CANCELLED"
}
```

### Cancellation Logic

-   **Only PENDING or COMPLETED transactions can be cancelled**
-   **Refund**: User balance is restored to balance_before amount
-   **Status**: Changed from COMPLETED/PENDING to CANCELLED
-   **Balance Update**: balance_after = balance_before (refund full amount)

### Example cURL

```bash
curl -X PUT http://localhost:4000/v1/api/stock-transactions/transactions/67456a8c9d2e1f5a3b8c0d1e/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "reason": "Thay đổi ý định"
  }'
```

---

## 5. Get User Transaction Stats

**Retrieve user's transaction statistics and portfolio overview (requires authentication)**

### Request

```http
GET /v1/api/stock-transactions/transactions/:userId/stats
Authorization: Bearer <jwt_token>
```

### URL Parameters

| Param    | Type   | Required | Description     |
| -------- | ------ | -------- | --------------- |
| `userId` | string | ✅       | MongoDB User ID |

### Headers

| Header          | Required | Description                     |
| --------------- | -------- | ------------------------------- |
| `Authorization` | ✅       | Bearer token for authentication |

### Success Response (200)

```json
{
    "statusCode": 200,
    "message": "Get user transaction stats successfully",
    "metadata": {
        "balance": 98650000,
        "buy_transactions_count": 8,
        "sell_transactions_count": 2,
        "total_spent": 3450000,
        "total_earned": 500000,
        "average_transaction_value": 400000,
        "most_traded_stock": {
            "stock_code": "VNM",
            "stock_name": "Vinamilk",
            "transaction_count": 4,
            "total_quantity": 25
        }
    }
}
```

### Stats Fields

| Field                       | Type   | Description                                |
| --------------------------- | ------ | ------------------------------------------ |
| `balance`                   | number | Current user balance (VND)                 |
| `buy_transactions_count`    | number | Total BUY transactions                     |
| `sell_transactions_count`   | number | Total SELL transactions                    |
| `total_spent`               | number | Total amount spent on BUY transactions     |
| `total_earned`              | number | Total amount earned from SELL transactions |
| `average_transaction_value` | number | Average transaction amount                 |
| `most_traded_stock`         | object | Most frequently traded stock with details  |

### Error Response (401)

```json
{
    "statusCode": 401,
    "message": "Unauthorized - Token required"
}
```

### Example cURL

```bash
curl -X GET http://localhost:4000/v1/api/stock-transactions/transactions/69293046bcbc4ea01b8b76ce/stats \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 6. Get User Ranking

**Retrieve user ranking by total profit from stock transactions**

### Request

```http
GET /v1/api/stock-transactions/ranking?limit=10&page=1
```

### Query Parameters

| Param   | Type   | Default | Max | Description                |
| ------- | ------ | ------- | --- | -------------------------- |
| `limit` | number | 10      | 100 | Number of users per page   |
| `page`  | number | 1       | -   | Page number for pagination |

### Success Response (200)

```json
{
    "statusCode": 200,
    "message": "Get user ranking by profit successfully",
    "metadata": {
        "ranking": [
            {
                "rank": 1,
                "user_id": "69293046bcbc4ea01b8b76ce",
                "user_fullName": "Đặng Đăng Khoa",
                "user_avatar": "https://...",
                "total_profit": 5250000,
                "transaction_count": 8,
                "stock_details": [
                    {
                        "stock_code": "VNM",
                        "stock_name": "Vinamilk",
                        "quantity": 10,
                        "buy_price": 95000,
                        "current_price": 98000,
                        "profit_per_share": 3000,
                        "total_profit": 30000
                    },
                    {
                        "stock_code": "VCB",
                        "stock_name": "Vietcombank",
                        "quantity": 5,
                        "buy_price": 80000,
                        "current_price": 85000,
                        "profit_per_share": 5000,
                        "total_profit": 25000
                    }
                ]
            },
            {
                "rank": 2,
                "user_id": "69120691da032aef8ad6f7a6",
                "user_fullName": "Nguyễn Văn A",
                "user_avatar": "https://...",
                "total_profit": 3750000,
                "transaction_count": 5,
                "stock_details": [
                    {
                        "stock_code": "FPT",
                        "stock_name": "FPT Software",
                        "quantity": 20,
                        "buy_price": 120000,
                        "current_price": 125000,
                        "profit_per_share": 5000,
                        "total_profit": 100000
                    }
                ]
            }
        ],
        "pagination": {
            "current_page": 1,
            "limit": 10,
            "total_users": 25,
            "total_pages": 3,
            "offset": 0
        }
    }
}
```

### Ranking Fields

| Field               | Type     | Description                                  |
| ------------------- | -------- | -------------------------------------------- |
| `rank`              | number   | Ranking position (1 = highest profit)        |
| `user_id`           | ObjectId | User ID                                      |
| `user_fullName`     | string   | User full name                               |
| `user_avatar`       | string   | User avatar URL                              |
| `total_profit`      | number   | Total profit from all BUY transactions (VND) |
| `transaction_count` | number   | Total BUY transactions                       |
| `stock_details`     | array    | Details of each stock holding                |

### Stock Details Fields

| Field              | Type   | Description                                               |
| ------------------ | ------ | --------------------------------------------------------- |
| `stock_code`       | string | Stock symbol (VNM, VCB, etc.)                             |
| `stock_name`       | string | Stock full name                                           |
| `quantity`         | number | Number of shares held                                     |
| `buy_price`        | number | Original buy price per share (VND)                        |
| `current_price`    | number | Current market price per share (VND)                      |
| `profit_per_share` | number | Profit per share (current_price - buy_price)              |
| `total_profit`     | number | Total profit for this stock (profit_per_share × quantity) |

### Pagination Fields

| Field          | Type   | Description           |
| -------------- | ------ | --------------------- |
| `current_page` | number | Current page number   |
| `limit`        | number | Records per page      |
| `total_users`  | number | Total number of users |
| `total_pages`  | number | Total number of pages |
| `offset`       | number | Offset from beginning |

### Example Requests

**Get top 10 users by profit**

```bash
curl "http://localhost:4000/v1/api/stock-transactions/ranking?limit=10&page=1"
```

**Get top 20 users (2nd page with limit 10)**

```bash
curl "http://localhost:4000/v1/api/stock-transactions/ranking?limit=10&page=2"
```

**Get top 5 users**

```bash
curl "http://localhost:4000/v1/api/stock-transactions/ranking?limit=5&page=1"
```

### Calculation Logic

**Total Profit Calculation:**

```
For each BUY transaction:
  profit = (current_market_price - buy_price) × quantity

total_profit = sum of all profits from BUY transactions
```

**Data Source:**

-   Historical buy prices from user's BUY transactions
-   Current market prices fetched from VNStock API in real-time
-   Only considers COMPLETED BUY transactions

### Notes

-   Profit is calculated only for BUY transactions (SELL transactions are excluded)
-   Current prices are fetched in real-time from VNStock
-   Only COMPLETED transactions are included in ranking
-   Ranking is sorted by total_profit in descending order
-   If VNStock API fails, profit for that stock cannot be calculated
-   Users with no transactions or negative profit still appear in ranking

---

## Error Codes

### Common HTTP Status Codes

| Code    | Message               | Cause                                                    |
| ------- | --------------------- | -------------------------------------------------------- |
| **200** | OK                    | Request successful                                       |
| **400** | Bad Request           | Invalid input, insufficient balance, or validation error |
| **401** | Unauthorized          | Missing or invalid authentication token                  |
| **403** | Forbidden             | User lacks permission to perform this action             |
| **404** | Not Found             | Resource (transaction/user) not found                    |
| **500** | Internal Server Error | Server-side error                                        |

### Specific Error Messages

| Message | Status | Solution |
| --- | --- | --- |
| `Insufficient balance. Required: X, Available: Y` | 400 | Add more balance to account |
| `Quantity must be greater than 0` | 400 | Use valid quantity > 0 |
| `Price must be greater than or equal to 0` | 400 | Use valid price ≥ 0 |
| `Transaction type must be BUY or SELL` | 400 | Use correct transaction_type |
| `User not found` | 400 | Verify user exists in system |
| `Transaction not found` | 404 | Verify transaction ID is correct |
| `Cannot cancel transaction with status CANCELLED` | 400 | Transaction already cancelled |
| `You do not have permission to view this transaction` | 403 | User owns different transaction |
| `Unauthorized - Token required` | 401 | Include valid JWT in Authorization header |

---

## Data Models

### Transaction Object

```typescript
{
  _id: ObjectId;
  user_id: ObjectId;                    // Reference to User
  stock_code: string;                   // VNM, VCB, etc.
  stock_name: string;                   // Full stock name
  quantity: number;                     // Shares count
  price_per_unit: number;               // Price per share (VND)
  total_amount: number;                 // quantity × price_per_unit
  transaction_type: "BUY" | "SELL";
  transaction_status: "PENDING" | "COMPLETED" | "CANCELLED" | "FAILED";
  balance_before: number;               // User balance before transaction
  balance_after: number;                // User balance after transaction
  cancellation_reason?: string;         // Reason for cancellation
  cancelled_at?: Date;                  // Cancellation timestamp
  executed_at: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Pagination Object

```typescript
{
    page: number; // Current page (1-indexed)
    limit: number; // Records per page
    total: number; // Total records matching filter
    totalPages: number; // Total pages available
}
```

### User Balance Fields

```typescript
{
    _id: ObjectId;
    // ... other user fields
    balance: number; // Current available balance (VND)
}
```

---

## Request/Response Summary Table

| Endpoint | Method | Auth | Params | Query | Body | Returns |
| --- | --- | --- | --- | --- | --- | --- |
| `/transactions` | POST | ❌ | - | - | ✅ | Transaction |
| `/transactions/:userId` | GET | ❌ | userId | type, code, status, page, limit | - | Transactions[] + Pagination |
| `/transactions/:transactionId` | GET | ✅ | transactionId | - | - | Transaction |
| `/transactions/:transactionId/cancel` | PUT | ✅ | transactionId | - | reason | Transaction |
| `/transactions/:userId/stats` | GET | ✅ | userId | - | - | Stats |
| `/ranking` | GET | ❌ | - | limit, page | - | Ranking[] + Pagination |

---

## Usage Examples

### Example 1: Create Buy Transaction

```bash
curl -X POST http://localhost:4000/v1/api/stock-transactions/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "stock_code": "VNM",
    "stock_name": "Vinamilk",
    "quantity": 5,
    "price_per_unit": 95000,
    "transaction_type": "BUY"
  }'
```

**Response**: Transaction created, balance reduced by 475,000 VND

---

### Example 2: View Transaction History

```bash
curl "http://localhost:4000/v1/api/stock-transactions/transactions/69293046bcbc4ea01b8b76ce?transaction_type=BUY&page=1&limit=10"
```

**Response**: List of all BUY transactions with pagination

---

### Example 3: View Transaction Details

```bash
curl http://localhost:4000/v1/api/stock-transactions/transactions/67456a8c9d2e1f5a3b8c0d1e \
  -H "Authorization: Bearer TOKEN"
```

**Response**: Full transaction details

---

### Example 4: Cancel Transaction

```bash
curl -X PUT http://localhost:4000/v1/api/stock-transactions/transactions/67456a8c9d2e1f5a3b8c0d1e/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"reason": "Thay đổi ý định"}'
```

**Response**: Transaction cancelled, balance refunded

---

### Example 5: View Stats

```bash
curl http://localhost:4000/v1/api/stock-transactions/transactions/69293046bcbc4ea01b8b76ce/stats \
  -H "Authorization: Bearer TOKEN"
```

**Response**: User portfolio statistics

---

### Example 6: Get User Ranking

```bash
curl "http://localhost:4000/v1/api/stock-transactions/ranking?limit=10&page=1"
```

**Response**: Top 10 users ranked by total profit with their stock holdings

---

## Notes

-   **Authentication**: Endpoints requiring auth use JWT Bearer tokens in `Authorization` header
-   **Pagination**: Default limit is 10, max is 100 records per page
-   **Timestamps**: All dates in ISO 8601 format (UTC)
-   **Currency**: All monetary values in VND (Vietnamese Dong)
-   **Validation**: Zod validation applied to all request payloads
-   **Atomicity**: Transactions and balance updates are atomic operations
-   **Indexes**: Queries optimized with MongoDB indexes on user_id, stock_code, created_at
-   **Ranking Optimization**: Stock prices are fetched once and cached in memory during ranking calculation to minimize API calls
-   **Error Handling**: If VNStock API fails for a stock, that stock's profit shows as null but doesn't block the ranking

---

## Support

For issues or questions:

1. Check error response message for details
2. Verify request format matches documentation
3. Ensure authentication token is valid
4. Check user balance is sufficient for BUY transactions
5. Review server logs for additional debugging information
