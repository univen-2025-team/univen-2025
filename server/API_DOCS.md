# API Documentation

Base URL: `/v1/api`

## Authentication (`/auth`)

### Sign Up

Create a new user account.

-   **Endpoint**: `POST /auth/sign-up`
-   **Body**:
    ```json
    {
        "email": "user@example.com",
        "password": "securepassword",
        "user_fullName": "John Doe"
    }
    ```
-   **Response**: User object and tokens.

### Login

Authenticate an existing user.

-   **Endpoint**: `POST /auth/login`
-   **Body**:
    ```json
    {
        "email": "user@example.com",
        "password": "securepassword"
    }
    ```
-   **Response**: User object and tokens (accessToken, refreshToken).

### Login with Google

Initiate Google OAuth flow.

-   **Endpoint**: `GET /auth/login/google`
-   **Query Parameters**: None (redirects to Google).

### Login with Google Callback

Callback URL for Google OAuth.

-   **Endpoint**: `GET /auth/login/google/callback`
-   **Query Parameters**: `code` (provided by Google).

### Login as Guest

Create and login as a temporary guest user.

-   **Endpoint**: `POST /auth/login/guest`
-   **Body**: None
-   **Response**: Guest user object and tokens.

### Refresh Token

Get a new access token using a refresh token.

-   **Endpoint**: `POST /auth/new-token`
-   **Body**:
    ```json
    {
        "refreshToken": "your_refresh_token"
    }
    ```
-   **Response**: New access token and refresh token.

### Logout

Logout the current user.

-   **Endpoint**: `POST /auth/logout`
-   **Headers**: `x-client-id`, `authorization`
-   **Response**: Success message.

### Forgot Password

Reset password for a user.

-   **Endpoint**: `PATCH /auth/forgot-password`
-   **Body**:
    ```json
    {
        "email": "user@example.com",
        "newPassword": "new_secure_password"
    }
    ```
-   **Response**: Success message.

---

## OTP (`/otp`)

### Send OTP

Send an OTP to an email address.

-   **Endpoint**: `POST /otp/send`
-   **Body**:
    ```json
    {
        "email": "user@example.com"
    }
    ```

### Verify OTP

Verify a sent OTP.

-   **Endpoint**: `POST /otp/verify`
-   **Body**:
    ```json
    {
        "email": "user@example.com",
        "otp": "123456"
    }
    ```

---

## User (`/user`)

All endpoints require authentication headers (`x-client-id`, `authorization`).

### Get Profile

Get the profile of the current user.

-   **Endpoint**: `GET /user/profile`

### Update Profile

Update current user's profile information.

-   **Endpoint**: `PATCH /user/profile`
-   **Body**:
    ```json
    {
        "user_fullName": "New Name",
        "user_gender": true, // true: Male, false: Female
        "user_dayOfBirth": "1990-01-01"
    }
    ```

### Upload Avatar

Upload a new avatar for the user.

-   **Endpoint**: `POST /user/upload-avatar`
-   **Content-Type**: `multipart/form-data`
-   **Body**:
    -   `avatar`: File

---

## Chats (`/chats`)

### Get Chat Suggestions

Get AI-generated chat suggestions and replies.

-   **Endpoint**: `POST /chats/getChat`
-   **Body**:
    ```json
    {
        "conversationId": "unique_conv_id",
        "userId": "user_id",
        "locale": "vi-VN"
    }
    ```
-   **Response**: AI reply and suggestions.

---

## Stock Transactions (`/stock-transactions`)

Most endpoints require authentication.

### Create Transaction

Create a new buy or sell order.

-   **Endpoint**: `POST /stock-transactions/transactions`
-   **Body**:
    ```json
    {
        "stock_code": "VCB",
        "quantity": 100,
        "price_per_unit": 90000,
        "transaction_type": "BUY" // or "SELL"
    }
    ```

### Get Transaction History

Get history of transactions for a user.

-   **Endpoint**: `GET /stock-transactions/transactions/:userId`
-   **Query Parameters**:
    -   `transaction_type`: `BUY` or `SELL`
    -   `stock_code`: Filter by stock symbol
    -   `status`: Transaction status
    -   `page`: Page number (default 1)
    -   `limit`: Items per page (default 10)

### Get Transaction by ID

Get details of a specific transaction.

-   **Endpoint**: `GET /stock-transactions/transactions/:transactionId`

### Cancel Transaction

Cancel a pending transaction.

-   **Endpoint**: `PUT /stock-transactions/transactions/:transactionId/cancel`
-   **Body**:
    ```json
    {
        "reason": "Changed mind"
    }
    ```

### Get User Statistics

Get trading statistics for a user.

-   **Endpoint**: `GET /stock-transactions/transactions/:userId/stats`

### Get User Ranking

Get leaderboard of top users by profit.

-   **Endpoint**: `GET /stock-transactions/ranking`
-   **Query Parameters**:
    -   `limit`: Number of users (default 10)
    -   `page`: Page number

---

## Market Cache (`/market`)

Public endpoints for cached market data.

### Get Market Data

Get overview market data (VN30 index, top movers).

-   **Endpoint**: `GET /market`
-   **Query Parameters**:
    -   `date`: `YYYY-MM-DD` (optional, defaults to latest)

### Get Stock Data

Get cached data for a specific stock.

-   **Endpoint**: `GET /market/stock/:symbol`
-   **Query Parameters**:
    -   `date`: `YYYY-MM-DD` (optional)

### Get All Stocks

Get all cached stocks for a specific date.

-   **Endpoint**: `GET /market/stocks`
-   **Query Parameters**:
    -   `date`: `YYYY-MM-DD` (Required)

### Get Available Dates

Get a list of dates that have cached data.

-   **Endpoint**: `GET /market/dates`
-   **Query Parameters**:
    -   `limit`: Number of dates to return (default 30)

### Get VN30 History

Get historical data for VN30 index.

-   **Endpoint**: `GET /market/history/vn30`
-   **Query Parameters**:
    -   `limit`: Number of data points
    -   `type`: `daily` or `intraday`

---

## Media (`/media`)

### Get Media

Serve uploaded media files.

-   **Endpoint**: `GET /media/:id`
