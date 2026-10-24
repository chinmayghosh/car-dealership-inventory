# Test Report

Generated on 2026-10-24 with `node scripts/generate-test-report.mjs`.

| Suite | Runner | Result | Status |
| --- | --- | --- | --- |
| Backend (API, services, middleware) | Jest + Supertest against a real SQLite test database | 89 passed of 89 | ✅ passing |
| Frontend (components, pages, API client) | Vitest + React Testing Library (jsdom) | 64 passed of 64 | ✅ passing |

## Backend

### Coverage summary

```
Statements   : 100% ( 207/207 )
Branches     : 86.95% ( 40/46 )
Functions    : 100% ( 59/59 )
Lines        : 100% ( 202/202 )
```

### Coverage by file

```
------------------------|---------|----------|---------|---------|-------------------
File                    | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
------------------------|---------|----------|---------|---------|-------------------
All files               |     100 |    86.95 |     100 |     100 |                   
 src                    |     100 |       50 |     100 |     100 |                   
  app.ts                |     100 |      100 |     100 |     100 |                   
  config.ts             |     100 |       50 |     100 |     100 | 5-8               
 src/db                 |     100 |      100 |     100 |     100 |                   
  prisma.ts             |     100 |      100 |     100 |     100 |                   
 src/errors             |     100 |    33.33 |     100 |     100 |                   
  HttpError.ts          |     100 |    33.33 |     100 |     100 | 20-24             
 src/middleware         |     100 |      100 |     100 |     100 |                   
  auth.ts               |     100 |      100 |     100 |     100 |                   
  errorHandler.ts       |     100 |      100 |     100 |     100 |                   
  validate.ts           |     100 |      100 |     100 |     100 |                   
 src/modules/auth       |     100 |      100 |     100 |     100 |                   
  auth.controller.ts    |     100 |      100 |     100 |     100 |                   
  auth.routes.ts        |     100 |      100 |     100 |     100 |                   
  auth.schemas.ts       |     100 |      100 |     100 |     100 |                   
  auth.service.ts       |     100 |      100 |     100 |     100 |                   
  user.repository.ts    |     100 |      100 |     100 |     100 |                   
 src/modules/vehicles   |     100 |      100 |     100 |     100 |                   
  vehicle.controller.ts |     100 |      100 |     100 |     100 |                   
  vehicle.repository.ts |     100 |      100 |     100 |     100 |                   
  vehicle.routes.ts     |     100 |      100 |     100 |     100 |                   
  vehicle.schemas.ts    |     100 |      100 |     100 |     100 |                   
  vehicle.service.ts    |     100 |      100 |     100 |     100 |                   
 src/utils              |     100 |      100 |     100 |     100 |                   
  jwt.ts                |     100 |      100 |     100 |     100 |                   
------------------------|---------|----------|---------|---------|-------------------
```

### Test cases

**tests/auth/login.test.ts** ✅
- ✅ returns a valid JWT and the user profile for correct credentials
- ✅ accepts the email in any letter case
- ✅ rejects a wrong password with 401
- ✅ rejects an unknown email with the same 401 message (no user enumeration)
- ✅ rejects a missing password with 400

**tests/auth/register.test.ts** ✅
- ✅ creates a user and returns a token with the public user profile
- ✅ never exposes or stores the plain-text password
- ✅ normalises the email to lower case
- ✅ ignores any attempt to self-assign the ADMIN role
- ✅ rejects a duplicate email with 409
- ✅ rejects missing name with 400
- ✅ rejects invalid email with 400
- ✅ rejects short password with 400

**tests/vehicles/purchase.test.ts** ✅
- ✅ buys one unit by default and returns the updated vehicle
- ✅ buys several units when a quantity is given
- ✅ can buy the last units, leaving the vehicle sold out
- ✅ rejects buying a sold-out vehicle with 409
- ✅ rejects buying more than is in stock with 409 and leaves stock untouched
- ✅ never oversells when two buyers race for the last unit
- ✅ rejects a zero quantity with 400
- ✅ rejects a negative quantity with 400
- ✅ rejects a fractional quantity with 400
- ✅ returns 404 for a vehicle that does not exist
- ✅ requires authentication

**tests/vehicles/restock.test.ts** ✅
- ✅ lets an admin increase stock and returns the updated vehicle
- ✅ brings a sold-out vehicle back into stock
- ✅ rejects a missing quantity with 400
- ✅ rejects a zero quantity with 400
- ✅ rejects a negative quantity with 400
- ✅ rejects a fractional quantity with 400
- ✅ returns 404 for a vehicle that does not exist
- ✅ forbids regular users and leaves stock unchanged
- ✅ requires authentication

**tests/vehicles/create.test.ts** ✅
- ✅ lets an admin add a vehicle and returns it with a generated id
- ✅ only requires make, model, category, price and quantity
- ✅ gives each vehicle a unique id
- ✅ requires authentication
- ✅ forbids regular users
- ✅ rejects missing make with 400
- ✅ rejects missing model with 400
- ✅ rejects unknown category with 400
- ✅ rejects negative price with 400
- ✅ rejects zero price with 400
- ✅ rejects negative quantity with 400
- ✅ rejects fractional quantity with 400
- ✅ rejects implausible year with 400
- ✅ rejects invalid image URL with 400

**tests/vehicles/update.test.ts** ✅
- ✅ lets an admin update some fields and leaves the others unchanged
- ✅ returns 404 for a vehicle that does not exist
- ✅ rejects an empty update body with 400
- ✅ rejects invalid values with 400
- ✅ forbids regular users
- ✅ requires authentication

**tests/vehicles/search.test.ts** ✅
- ✅ filters by make, case-insensitively
- ✅ matches partial model names
- ✅ filters by exact category
- ✅ filters by a price range (inclusive)
- ✅ supports an open-ended price range
- ✅ combines several filters with AND
- ✅ returns everything when no filters are given
- ✅ returns an empty list when nothing matches
- ✅ rejects a non-numeric price with 400
- ✅ rejects a negative price with 400
- ✅ rejects minPrice greater than maxPrice with 400
- ✅ rejects an unknown category with 400
- ✅ requires authentication

**tests/vehicles/list.test.ts** ✅
- ✅ returns an empty list when there is no inventory
- ✅ returns every vehicle, including sold-out ones, to any logged-in user
- ✅ lists the newest vehicles first
- ✅ requires authentication

**tests/vehicles/delete.test.ts** ✅
- ✅ lets an admin delete a vehicle
- ✅ returns 404 for a vehicle that does not exist
- ✅ forbids regular users and keeps the vehicle
- ✅ requires authentication

**tests/errorHandling.test.ts** ✅
- ✅ returns 404 JSON for unknown routes
- ✅ returns 400 for a malformed JSON body
- ✅ hides unexpected errors behind a generic 500

**tests/health.test.ts** ✅
- ✅ responds with status ok

**tests/auth/middleware.test.ts** ✅
- ✅ rejects a request with no Authorization header
- ✅ rejects a header that is not a Bearer token
- ✅ rejects a tampered or invalid token
- ✅ rejects an expired token
- ✅ attaches the authenticated user for a valid token
- ✅ forbids a regular user with 403
- ✅ allows an admin through

**tests/vehicles/vehicle.service.unit.test.ts** ✅
- ✅ decrements stock on purchase
- ✅ reports remaining stock when a purchase exceeds it
- ✅ increments stock on restock
- ✅ throws a 404 HttpError for unknown ids

## Frontend

### Coverage summary

```
Statements   : 98.01% ( 1232/1257 )
Branches     : 92.42% ( 293/317 )
Functions    : 94.89% ( 93/98 )
Lines        : 98.01% ( 1232/1257 )
```

### Coverage by file

```
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   98.01 |    92.42 |   94.89 |   98.01 |                   
 src               |     100 |      100 |     100 |     100 |                   
  App.tsx          |     100 |      100 |     100 |     100 |                   
  constants.ts     |     100 |      100 |     100 |     100 |                   
  types.ts         |       0 |        0 |       0 |       0 |                   
 src/api           |   93.33 |    88.23 |   85.71 |   93.33 |                   
  auth.ts          |   71.42 |      100 |       0 |   71.42 | 6,9               
  client.ts        |   93.44 |    81.81 |     100 |   93.44 | 12-13,20,27       
  vehicles.ts      |     100 |      100 |     100 |     100 |                   
 src/components    |   98.65 |    94.24 |   93.02 |   98.65 |                   
  AppLayout.tsx    |     100 |      100 |     100 |     100 |                   
  AuthLayout.tsx   |     100 |      100 |     100 |     100 |                   
  ...eteDialog.tsx |   91.17 |       80 |     100 |   91.17 | 24-26             
  FilterBar.tsx    |     100 |      100 |     100 |     100 |                   
  FormError.tsx    |     100 |      100 |     100 |     100 |                   
  FormField.tsx    |     100 |      100 |     100 |     100 |                   
  Logo.tsx         |     100 |      100 |     100 |     100 |                   
  Modal.tsx        |     100 |      100 |     100 |     100 |                   
  Navbar.tsx       |     100 |      100 |     100 |     100 |                   
  ...aseDialog.tsx |     100 |       90 |   66.66 |     100 | 24                
  ...ockDialog.tsx |   94.54 |    72.72 |     100 |   94.54 | 30-32             
  RouteGuards.tsx  |     100 |     87.5 |     100 |     100 | 18                
  VehicleCard.tsx  |     100 |      100 |     100 |     100 |                   
  VehicleForm.tsx  |   98.41 |    95.45 |     100 |   98.41 | 51-52             
  VehicleImage.tsx |     100 |      100 |      50 |     100 |                   
 src/context       |   94.25 |       76 |     100 |   94.25 |                   
  AuthContext.tsx  |    92.3 |    77.77 |     100 |    92.3 | 24-25,37,47       
  ToastContext.tsx |   97.14 |    71.42 |     100 |   97.14 | 41                
 src/hooks         |     100 |      100 |     100 |     100 |                   
  ...uncedValue.ts |     100 |      100 |     100 |     100 |                   
 src/lib           |     100 |      100 |     100 |     100 |                   
  errors.ts        |     100 |      100 |     100 |     100 |                   
  format.ts        |     100 |      100 |     100 |     100 |                   
 src/pages         |   98.55 |    93.87 |     100 |   98.55 |                   
  ...ntoryPage.tsx |   96.66 |    95.65 |     100 |   96.66 | 52,118-123        
  LoginPage.tsx    |     100 |       90 |     100 |     100 | 25                
  NotFoundPage.tsx |     100 |      100 |     100 |     100 |                   
  RegisterPage.tsx |     100 |    85.71 |     100 |     100 | 22-23             
  ShowroomPage.tsx |     100 |    96.29 |     100 |     100 | 56                
-------------------|---------|----------|---------|---------|-------------------
```

### Test cases

**src/lib/format.test.ts**
- ✅ formatPrice > formats whole dollars with thousands separators and no cents
- ✅ formatPrice > rounds fractional amounts to the nearest dollar
- ✅ stockLabel > says sold out at zero
- ✅ stockLabel > warns when only a few are left
- ✅ stockLabel > shows the count when stock is healthy

**src/api/vehicles.test.ts**
- ✅ vehiclesApi > lists everything from /api/vehicles when no filters are set
- ✅ vehiclesApi > uses the search endpoint with only the filters that are set
- ✅ vehiclesApi > maps each mutation to the right endpoint and method

**src/api/client.test.ts**
- ✅ apiRequest > sends JSON and returns the parsed body
- ✅ apiRequest > attaches the stored token as a Bearer header
- ✅ apiRequest > omits the Authorization header when logged out
- ✅ apiRequest > returns undefined for 204 No Content
- ✅ apiRequest > throws an ApiError carrying the server message and field errors
- ✅ apiRequest > clears the token and notifies listeners when the session has expired (401)
- ✅ apiRequest > turns a network failure into a friendly ApiError

**src/components/RouteGuards.test.tsx**
- ✅ ProtectedRoute > sends logged-out visitors to the login page
- ✅ ProtectedRoute > renders the page for a logged-in user
- ✅ AdminRoute > sends regular users back to the showroom
- ✅ AdminRoute > renders the page for an admin

**src/components/Modal.test.tsx**
- ✅ Modal > keeps focus on a field that asked for autoFocus, so typing goes straight into it
- ✅ Modal > focuses the dialog itself when no field asks for focus
- ✅ Modal > returns focus to the button that opened it after closing

**src/components/VehicleCard.test.tsx**
- ✅ VehicleCard > shows the key details of the vehicle
- ✅ VehicleCard > calls onPurchase with the vehicle when Purchase is clicked
- ✅ VehicleCard > disables the Purchase button and shows Sold out when quantity is zero
- ✅ VehicleCard > warns when stock is low
- ✅ VehicleCard > falls back to a placeholder when there is no image

**src/components/PurchaseDialog.test.tsx**
- ✅ PurchaseDialog > starts at one unit and shows the total price
- ✅ PurchaseDialog > updates the total as the quantity changes and caps it at the available stock
- ✅ PurchaseDialog > never goes below one unit
- ✅ PurchaseDialog > purchases the chosen quantity and reports the updated vehicle
- ✅ PurchaseDialog > shows the server error and stays open if the purchase fails
- ✅ PurchaseDialog > closes on Cancel and on Escape

**src/components/FilterBar.test.tsx**
- ✅ FilterBar > reports make and model text
- ✅ FilterBar > selects a category chip and toggles it off again
- ✅ FilterBar > reports a numeric price range
- ✅ FilterBar > clears every filter at once

**src/pages/ShowroomPage.test.tsx**
- ✅ ShowroomPage > loads and displays all vehicles
- ✅ ShowroomPage > shows an empty state when nothing matches
- ✅ ShowroomPage > shows an error with a retry button when loading fails
- ✅ ShowroomPage > searches with the filters after the user stops typing
- ✅ ShowroomPage > updates the card stock after a successful purchase

**src/App.test.tsx**
- ✅ App routing > sends a logged-out visitor to the login page
- ✅ App routing > shows the showroom without an Inventory link to a customer
- ✅ App routing > gives an admin the Inventory link and page
- ✅ App routing > redirects a signed-in user away from the login page
- ✅ App routing > logs out and returns to the login page
- ✅ App routing > shows a 404 page for unknown routes

**src/pages/InventoryPage.test.tsx**
- ✅ InventoryPage > lists every vehicle with summary stats
- ✅ InventoryPage > adds a vehicle through the form
- ✅ InventoryPage > edits a vehicle
- ✅ InventoryPage > restocks a vehicle
- ✅ InventoryPage > deletes a vehicle only after confirmation

**src/pages/LoginPage.test.tsx**
- ✅ LoginPage > logs in, stores the session and goes to the showroom
- ✅ LoginPage > shows the server error when credentials are wrong
- ✅ LoginPage > links to the registration page

**src/components/VehicleForm.test.tsx**
- ✅ VehicleForm > submits typed values, converting numbers and dropping empty optional fields
- ✅ VehicleForm > shows required-field errors and does not submit an empty form
- ✅ VehicleForm > is prefilled when editing an existing vehicle
- ✅ VehicleForm > shows field errors returned by the server

**src/pages/RegisterPage.test.tsx**
- ✅ RegisterPage > registers, signs the user in and goes to the showroom
- ✅ RegisterPage > blocks submission when the passwords do not match
- ✅ RegisterPage > blocks submission when the password is too short
- ✅ RegisterPage > shows the server error, e.g. for an email that is already registered
