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
6. [Error Codes](#error-codes)
7. [Data Models](#data-models)

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

## Notes

-   **Authentication**: Endpoints requiring auth use JWT Bearer tokens in `Authorization` header
-   **Pagination**: Default limit is 10, max is 100 records per page
-   **Timestamps**: All dates in ISO 8601 format (UTC)
-   **Currency**: All monetary values in VND (Vietnamese Dong)
-   **Validation**: Zod validation applied to all request payloads
-   **Atomicity**: Transactions and balance updates are atomic operations
-   **Indexes**: Queries optimized with MongoDB indexes on user_id, stock_code, created_at

---

## Support

For issues or questions:

1. Check error response message for details
2. Verify request format matches documentation
3. Ensure authentication token is valid
4. Check user balance is sufficient for BUY transactions
5. Review server logs for additional debugging information
