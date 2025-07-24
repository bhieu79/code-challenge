## �📁 Project Structure

```
src/problem5/
├── src/                   # TypeScript source files
│   ├── server.ts          # Main server file
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts       # Interfaces and types
│   ├── configs/           # Configuration files
│   │   └── database.ts    # SQLite database config & initialization
│   ├── services/          # Business logic layer
│   │   └── resourceService.ts
│   ├── controllers/       # HTTP request handlers
│   │   └── resourceController.ts
│   └── routes/           # API route definitions
│       └── resourceRoutes.ts
├── test/                 # TypeScript test files
│   └── api.test.ts       # Chai HTTP tests
├── dist/                 # Compiled JavaScript (auto-generated)
├── data/                 # Database files (auto-created)
│   └── resources.db      # SQLite database
├── tsconfig.json         # TypeScript configuration
├── package.json
└── README.md
```

## 🚀 Getting Started

### Install Dependencies
```bash
npm install
```

### Development Mode (Recommended)
```bash
# Start development server with hot reload
npm run dev

# Or with file watching (auto-restart on changes)
npm run dev:watch
```

### Production Mode
```bash
# Build TypeScript and start server
npm start

# Or build separately
npm run build
node dist/server.js
```

Server runs on `http://localhost:3000`

**Database Auto-Initialization:**
- SQLite database file is automatically created in `data/resources.db`
- Tables are created automatically on first run
- No manual database setup required!

### Run Tests
```bash
# Run tests in development (TypeScript directly)
npm run test:dev

# Run tests with file watching
npm run test:watch

# Run compiled tests (production)
npm test
```

## 🛠️ Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with tsx |
| `npm run dev:watch` | Start dev server with auto-restart |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Build and run production server |
| `npm run test:dev` | Run TypeScript tests directly |
| `npm run test:watch` | Run tests with file watching |
| `npm test` | Run compiled tests |

## 📋 API Endpoints

### Health Check
- **GET** `/health` - Check if server is running

### Resources
- **GET** `/api/resources` - Get all resources
- **GET** `/api/resources/:id` - Get resource by ID
- **POST** `/api/resources` - Create new resource
- **PUT** `/api/resources/:id` - Update resource (replace entire resource)
- **PATCH** `/api/resources/:id` - Patch resource (partial update)
- **DELETE** `/api/resources/:id` - Delete resource

### Query Parameters (GET /api/resources)
- `category` - Filter by category
- `status` - Filter by status (active/inactive)
- `search` - Search in name and description

## 📝 Usage Examples

### Health Check
```bash
curl http://localhost:3000/health
```

### Get All Resources
```bash
curl http://localhost:3000/api/resources
```

### Get Resource by ID
```bash
curl http://localhost:3000/api/resources/1
```

### Create Resource
```bash
curl -X POST http://localhost:3000/api/resources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Resource",
    "description": "A sample resource",
    "category": "Example"
  }'
```

### Update Resource (PUT - Replace Entire Resource)
```bash
# PUT requires name and description (replaces entire resource)
curl -X PUT http://localhost:3000/api/resources/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Completely Updated Resource",
    "description": "New description for the resource",
    "category": "Updated Category",
    "status": "inactive"
  }'
```

### Patch Resource (PATCH - Partial Update)
```bash
# PATCH only updates specified fields
curl -X PATCH http://localhost:3000/api/resources/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "inactive"
  }'

# Update multiple fields
curl -X PATCH http://localhost:3000/api/resources/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Partially Updated Name",
    "category": "New Category"
  }'
```

### Delete Resource
```bash
curl -X DELETE http://localhost:3000/api/resources/1
```

### Filter Resources
```bash
# Filter by category
curl "http://localhost:3000/api/resources?category=Example"

# Filter by status
curl "http://localhost:3000/api/resources?status=active"

# Search in name/description
curl "http://localhost:3000/api/resources?search=sample"

# Combined filters
curl "http://localhost:3000/api/resources?category=Example&status=active&search=guide"
```


### **Database Schema**
```sql
CREATE TABLE resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```



## 🧪 Testing

The project includes comprehensive Chai HTTP tests covering:
- ✅ Health check endpoint
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Input validation 
- ✅ Error handling (404, 400, 500)
- ✅ Resource filtering and search
- ✅ Database operations
- ✅ PUT vs PATCH behavior differences
- ✅ Status validation

### Test Commands:
```bash
# Development testing (fastest)
npm run test:dev

# Watch mode for TDD
npm run test:watch

# Production testing
npm test
```


### Type Definitions
The project includes comprehensive TypeScript interfaces:

```typescript
interface Resource {
  id?: number;
  name: string;
  description: string;
  category?: string;
  status?: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

interface CreateResourceRequest {
  name: string;
  description: string;
  category?: string;
  status?: 'active' | 'inactive';
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

### Type Safety Benefits
- **Compile-time error checking** - Catch errors before runtime
- **IntelliSense support** - Better IDE experience with autocomplete
- **Refactoring safety** - Rename and restructure with confidence
- **API contract enforcement** - Ensure request/response consistency
- **Database type safety** - Generic database methods with proper typing



### Key Components
- **Types** (`src/types/`) - Centralized type definitions
- **Routes** (`src/routes/`) - API endpoint definitions
- **Controllers** (`src/controllers/`) - Request handling and validation
- **Services** (`src/services/`) - Business logic and data processing
- **Database** (`src/configs/`) - Database connection and operations

