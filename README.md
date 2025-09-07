# 📁 Virtual Directory System

A TypeScript-based virtual file system that simulates hierarchical file/folder structures using a single database table, similar to a real filesystem but without interacting with the actual file system.

## 🎯 Objective

Design and implement a **virtual directory system** that simulates a hierarchical file/folder structure using a **single database table** — similar to a real filesystem — without interacting with the actual file system.

All operations are performed via **direct database queries** (SQL with recursive CTEs), **not through application-layer recursion**.

## 🛠️ Tech Stack

- **TypeScript** - Type-safe JavaScript
- **Node.js** - Runtime environment
- **Knex.js** - SQL query builder
- **SQLite3** - Lightweight database
- **Jest** - Testing framework
- **Zod** - Schema validation
- **dotenv** - Environment configuration

## ✨ Features

### Core Operations
- ✅ **Create** files and folders
- ✅ **List** directory contents
- ✅ **Rename** files and folders
- ✅ **Move** files and folders between directories
- ✅ **Remove** files and folders (with recursive deletion)

### Advanced Features
- 🔒 **Cyclic Move Prevention** - Prevents moving a folder into its own descendant using recursive CTEs
- 🧪 **Uniqueness Constraints** - Unique indexes on `(parent_id, name)` pairs, and unique index on (name) as well
- 🔁 **Recursive Delete** - Database-level recursive deletion using CTEs
- 📊 **Comprehensive Testing** - 28+ unit and integration tests
- 🎨 **Professional CLI** - User-friendly command-line interface

## 🚀 Getting Started

### 1. Installation

```bash
git clone <repository-url>
cd virtual-directory-system
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```bash
DATABASE_CLIENT=sqlite3
DATABASE_FILENAME=./data/app.db
```

### 3. Database Setup

```bash
# Run database migrations
npm run migrate:latest
```

### 4. Run Tests

```bash
# Run all tests
npm test

```

### 5. Start the Application

```bash

# Production mode
npm run build
npm start
```

## 📋 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run the compiled application |
| `npm test` | Run all tests |
| `npm run lint` | Run ESLint |
| `npm run migrate:latest` | Run pending migrations |
| `npm run migrate:rollback` | Rollback last migration |
| `npm run migrate:make --name=<name>` | Create new migration |

## 🏗️ Project Structure

```
src/
├── config/
│   └── env.ts              # Environment configuration with Zod validation
├── db/
│   └── knex.ts             # Database connection and configuration
├── service/
│   └── vdir.service.ts     # Business logic layer
├── repos/
│   └── vdir.repo.ts        # Data access layer
├── utils/
│   ├── helpers.ts          # Utility functions
│   └── types.ts            # TypeScript type definitions
├── tests/
│   ├── setup.ts            # Test setup and teardown
│   ├── vdir.unit.test.ts   # Unit tests (22 tests)
│   └── vdir.repo.test.ts   # Integration tests (6 tests)
└── index.ts                # CLI application entry point

migrations/                 # Database migration files
├── 20250906040037_initial_schema.ts
└── ...

knexfile.ts                 # Knex configuration
jest.config.js              # Jest configuration
```

## 🎮 CLI Usage

The application provides an interactive command-line interface:

```bash
vdir> help

📁 Virtual Directory System Commands:
=====================================
• create <name> <type> [parent_name]  - Create a file or folder
• list <parent_name>                  - List children of a folder
• rename <name> <new_name>            - Rename a file or folder
• move <name> <new_parent_name>       - Move to a different parent
• remove <name>                       - Remove a file or folder
• exit                                - Exit the application

Examples:
  create myfile file                  - Create a file at root
  create myfolder folder              - Create a folder at root
  create subfile file myfolder        - Create file inside myfolder
  list myfolder                       - List contents of myfolder
  rename myfile newfile               - Rename myfile to newfile
  move myfile myfolder                - Move myfile into myfolder
  remove myfile                       - Delete myfile
```

## 🧪 Testing

The project includes comprehensive test coverage:

- **Unit Tests**: 22 tests covering individual function behavior
- **Integration Tests**: 6 tests covering complex scenarios
- **Test Categories**:
  - Function validation and error handling
  - Complex nested structures
  - Recursive operations
  - Edge cases and error conditions

Run tests with:
```bash
npm test
```

## 🗄️ Database Schema

The system uses a single `nodes` table:

```sql
CREATE TABLE nodes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,  -- 'file' or 'folder'
  parent_id TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE UNIQUE INDEX idx_nodes_parent_name ON nodes(parent_id, name);
CREATE UNIQUE INDEX idx_nodes_name ON nodes(name);
CREATE INDEX idx_nodes_parent_id ON nodes(parent_id);
```

## 🔧 Architecture

The application follows a clean architecture pattern:

- **Presentation Layer** (`index.ts`) - CLI interface
- **Service Layer** (`vdir.service.ts`) - Business logic
- **Repository Layer** (`vdir.repo.ts`) - Data access
- **Database Layer** (`knex.ts`) - Database connection

## 📈 Performance Features

- **Recursive CTEs** for efficient tree operations
- **Database-level constraints** for data integrity
- **Optimized queries** with proper indexing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the ISC License.