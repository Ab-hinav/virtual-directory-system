# Virtual Directory System

## Objective

Design and implement a **virtual directory system** that simulates a hierarchical file/folder structure using a **single database table or collection** — similar to a real filesystem — without interacting with the actual file system.

All operations must be performed via **direct database queries** (e.g., SQL, MongoDB , etc.), **not through application-layer recursion**.

## The Setup

- This project uses typescript(node.js) , knex, jest  and sqlite3 to achieve the objective
- Env config via dotenv + zod validation (`src/config/env.ts`)
- Knex configured (SQLite by default) with TypeScript `knexfile.ts`
- Jest configured with ts-jest for unit and integration tests

## Bonus Features Covered
- 🔒 Cyclic Move Prevention : please check move function in vdir.repo.ts , a recursive CTE checks all the sub files and folders of the parentId , and ensures we dont move a parent into one of its children folder
- ✅ Unit Tests - covered each function 1 create 2 list 3 rename 4 remove 5 move
- 🧪 Uniqueness Constraint - unique index on name , and (parent_id,name) as well as duplicate name check via query
- 🔁 Recursive Delete via DB - covered in the remove repo function with recursive CTE
  

## Getting started

1. Clone the Repo Into a folder and run npm i

```bash

git clone URL
npm install


```

  

2. Create an `.env` file (example values):

```bash

DATABASE_CLIENT=sqlite3

DATABASE_FILENAME=./data/app.db

```

  

3. Run migrations

```bash

npm run migrate:latest

```

  

4. Run tests

```bash

npm run test

```

  

5. Run commandline program


```bash

npm run build
npm run start

```

  
## Scripts

- `dev`: Run `src/index.ts` with watch
- `build`: Compile TypeScript to `dist`
- `start`: Run compiled app
- `migrate:*`: Knex migration commands (TS `knexfile.ts`)
- `test`: Run Jest

  
## Project structure


```

src/

config/env.ts

db/knex.ts

index.ts

service/

vdir.service.ts

repos/

vdir.repo.ts

migrations/

tests/

setup.ts

vdir.unit.test.ts

vdir.service.test.ts

knexfile.ts

jest.config.js

```