# Live Scoreboard API Service Module

## Overview

This module provides a real-time scoreboard system that displays the top 10 user scores with live updates. The system ensures secure score updates through proper authentication and authorization mechanisms while providing real-time data synchronization across all connected clients.

## Architecture Components

### Core Components

1. **Score Management Service** - Handles score updates and validation
2. **Real-time Communication Layer** - WebSocket-based live updates
3. **Leaderboard Cache** - High-performance score ranking
4. **Database Layer** - Persistent score storage

### Security Components

5. **Authentication & Authorization** - JWT token validation (assumes existing login system)
6. **Rate Limiting** - Anti-abuse protection

## System Assumptions

### Existing Infrastructure
- **Login System**: User authentication and registration already exists
- **JWT Implementation**: System already issues and validates JWT tokens
- **User Management**: User accounts, passwords, and sessions handled externally
- **Database**: Existing database infrastructure available

### Integration Points
- **JWT Token Validation**: Scoreboard API validates tokens issued by existing auth system
- **User Identification**: JWT payload contains user ID and username for score attribution
- **Session Management**: Existing system handles login/logout, token refresh, etc.

## API Endpoints

### 1. Score Update Endpoint
```
POST /api/scores/update
```

**Purpose**: Update user score after completing an action

**Headers**:
- `Authorization: Bearer <jwt_token>`
- `Content-Type: application/json`

**Request Body**:
```json
{
  "actionId": "string",
  "scoreIncrement": "number",
  "timestamp": "ISO8601",
  "actionSignature": "string"
}
```

**Response**:
```json
{
  "success": true,
  "newScore": 1250,
  "rank": 5,
  "message": "Score updated successfully"
}
```

### 2. Leaderboard Retrieval
```
GET /api/leaderboard/top10
```

**Purpose**: Get current top 10 scores

**Response**:
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "userId": "user123",
      "username": "player1",
      "score": 2500,
      "lastUpdated": "2024-01-15T10:30:00Z"
    }
    // ... complete top 10
  ],
  "lastRefresh": "2024-01-15T10:30:00Z"
}
```

### 3. User Score Retrieval
```
GET /api/users/{userId}/score
```

**Purpose**: Get current user's score and basic stats

**Headers**:
- `Authorization: Bearer <jwt_token>`

**Response**:
```json
{
  "id": 123,
  "username": "player1",
  "total_score": 1250,
  "created_at": "2024-01-10T08:00:00Z",
  "last_score_update": "2024-01-15T10:30:00Z"
}
```

### 4. WebSocket Connection
```
WS /ws/leaderboard
```

**Purpose**: Real-time leaderboard updates

**Authentication**: JWT token via query parameter or header

**Events**:
- `leaderboard_update`: Broadcast to all clients when any top 10 score changes
- `user_score_update`: Sent to specific user when their score changes (includes rank information)

## Security Measures

### 1. Authentication
- **Existing System Integration**: Validates JWT tokens issued by existing login system
- **Token Validation**: Verifies token signature, expiration, and user claims
- **No User Management**: Does not handle login, registration, or password management

### 2. Authorization
- Action-based permissions
- User role verification
- Score increment validation

### 3. Anti-Fraud Protection
- **Action Signature Verification**: Each score update must include a cryptographic signature
- **Rate Limiting**: Maximum score updates per user per time window
- **Anomaly Detection**: Unusual scoring patterns flagged for review
- **Action Validation**: Server-side verification of completed actions

### 4. Input Validation
- Score increment bounds checking
- Timestamp validation (prevent replay attacks)
- Action ID verification against valid actions

## Data Models

### User Score Model
```javascript
{
  userId: String,
  username: String,
  total_score: Number,
  lastActionTimestamp: Date,
  actionHistory: [{
    actionId: String,
    scoreGained: Number,
    timestamp: Date,
    verified: Boolean
  }]
}
```

### Leaderboard Cache Model
```javascript
{
  rank: Number,
  userId: String,
  username: String,
  score: Number,
  lastUpdated: Date
}
```

## Real-time Updates Flow

1. User completes action on frontend
2. Frontend generates action signature
3. API call sent to `/api/scores/update`
4. Server validates authentication and action
5. Atomic Redis write-through operations (HINCRBY + ZINCRBY)
6. Return success response to user immediately
7. Background operations (asynchronous):
   - Write-through to database
   - Send `user_score_update` via WebSocket
   - Check top 10 and broadcast `leaderboard_update` if needed
8. Frontend updates user's personal score and leaderboard display

## Performance Considerations

### Caching Strategy
- **Redis Write-Through Cache**: Atomic operations with sorted sets for automatic ranking
- **Data Structures**:
  - **Sorted Set**: `leaderboard` - automatic ranking by score (`ZSET`)
  - **User Hashes**: `user:{userId}` - individual user data (`HASH`)
- **Atomic Operations**: `HINCRBY` and `ZINCRBY` prevent race conditions
- **Automatic Ranking**: Redis sorted sets handle ranking without manual sorting
- **Parallel Processing**: Database writes, user notifications, and leaderboard checks run concurrently
- **Performance**: O(log N) complexity for score updates, concurrent-safe, non-blocking operations

### Database Optimization
- **Indexed Queries**: Optimized for score-based sorting
- **Read Replicas**: Separate read/write operations
- **Batch Updates**: Group multiple score updates when possible

### WebSocket Management
- **Connection Pooling**: Efficient connection management
- **Message Queuing**: Handle high-frequency updates
- **Graceful Degradation**: Fallback to polling if WebSocket fails

### Performance Optimizations
- **Parallel Processing**: Database writes, user notifications, and leaderboard checks execute concurrently
- **Non-blocking Operations**: User gets immediate feedback while database operations complete in background
- **Atomic Redis Operations**: Single transaction for score and ranking updates prevents race conditions
- **Efficient Cache Lookups**: O(log N) sorted set operations for leaderboard queries

### Broadcasting Strategy

#### Individual User Updates (Always Sent)
- **Target**: Specific user who performed the action
- **Trigger**: Every score update, regardless of ranking (parallel with other operations)
- **Purpose**: Immediate feedback and score confirmation
- **Event Type**: `user_score_update`
- **Performance**: Non-blocking, sent concurrently with database writes

#### Leaderboard Updates (Atomic Redis Operations)
- **Target**: All connected clients
- **Trigger**: After atomic Redis operations, check if user in top 10
- **Purpose**: Keep leaderboard display current with latest scores
- **Event Type**: `leaderboard_update`
- **Redis Operations**:
  - **Atomic Updates**: `HINCRBY` and `ZINCRBY` execute atomically
  - **Automatic Ranking**: Sorted set maintains order without manual calculation
  - **Concurrent Safe**: Multiple simultaneous updates handled correctly
  - **Top 10 Retrieval**: `ZREVRANGE leaderboard 0 9 WITHSCORES`


## Error Handling

### Common Error Responses
```json
{
  "error": {
    "code": "INVALID_ACTION",
    "message": "Action signature verification failed",
    "details": "The provided action signature is invalid or expired"
  }
}
```

### Error Codes
- `UNAUTHORIZED`: Invalid or expired authentication
- `INVALID_ACTION`: Action verification failed
- `RATE_LIMITED`: Too many requests
- `INVALID_SCORE`: Score increment out of bounds
- `SERVER_ERROR`: Internal server error

## Monitoring & Logging

### Key Metrics
- Score update frequency per user
- WebSocket connection count
- API response times
- Cache hit/miss ratios
- Failed authentication attempts

### Logging Requirements
- All score updates with user ID and timestamp
- Failed authentication attempts
- Suspicious activity patterns
- System performance metrics

## Deployment Considerations

### Scaling Recommendations
- **Horizontal Scaling**: Multiple API server instances
- **Load Balancing**: Distribute WebSocket connections
- **Caching Layer**: Distributed Redis cache
- **Database**: Read replicas for high availability

## Technical Implementation Details

### Redis Data Structures

### Leaderboard Sorted Set
```redis
# Sorted set for automatic ranking (key: leaderboard)
ZADD leaderboard 2500 123    # user 123 has score 2500
ZADD leaderboard 2400 456    # user 456 has score 2400
ZADD leaderboard 2300 789    # user 789 has score 2300

# Get top 10 with scores
ZREVRANGE leaderboard 0 9 WITHSCORES
# Returns: [123, 2500, 456, 2400, 789, 2300, ...]

# Atomic score increment
ZINCRBY leaderboard 50 123   # Add 50 to user 123's score
```

### User Data Hashes
```redis
# Individual user data (key: user:{userId})
HSET user:123 username "player1" total_score 2500 created_at "2024-01-10T08:00:00Z"
HSET user:456 username "player2" total_score 2400 created_at "2024-01-12T10:00:00Z"

# Set TTL for cache expiration (5 minutes)
EXPIRE user:123 300
EXPIRE user:456 300

# Atomic score increment
HINCRBY user:123 total_score 50   # Add 50 to user 123's total score
```

### Atomic Operations Example
```redis
# Update score atomically (both operations succeed or fail together)
MULTI
HINCRBY user:123 total_score 50
ZINCRBY leaderboard 50 123
EXEC
```

## Database Schema

#### User Score Table
```sql
CREATE TABLE user_score (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    total_score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_score_total ON user_score(total_score DESC);
```

#### Score Updates Table
```sql
CREATE TABLE score_updates (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES user_score(id),
    score_increment INTEGER NOT NULL,
    action_signature VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_score_updates_user ON score_updates(user_id);
CREATE INDEX idx_score_updates_time ON score_updates(created_at DESC);
```

### WebSocket Event Specifications

#### Leaderboard Update Event
```json
{
  "type": "leaderboard_update",
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "id": 456,
        "username": "newleader",
        "total_score": 2550
      },
      {
        "rank": 2,
        "id": 123,
        "username": "player1",
        "total_score": 2500
      },
      {
        "rank": 3,
        "id": 789,
        "username": "player3",
        "total_score": 2400
      },
      {
        "rank": 4,
        "id": 234,
        "username": "player4",
        "total_score": 2300
      },
      {
        "rank": 5,
        "id": 567,
        "username": "player5",
        "total_score": 2200
      }
      // ... complete top 10
    ],
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**Note**: When top 10 updates, always send the **complete top 10 array** to all connected clients. This ensures:
- Simple frontend implementation (just replace entire leaderboard)
- Consistent state across all clients
- Handles all ranking scenarios (new entries, position swaps, ties)
- Minimal network overhead (only 10 records maximum)

#### User Score Update Event
```json
{
  "type": "user_score_update",
  "data": {
    "id": 123,
    "username": "player1",
    "total_score": 1250,
    "score_increment": 25,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

