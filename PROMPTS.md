# Prompts for Antigravity (simple version)

Use them **one at a time, in order**. Start every new chat by pasting Prompt 0. After each prompt: run the check line, then `git commit`.

| # | Task | Check |
|---|---|---|
| 0 | Working rules (paste first, every chat) | |
| 1 | Clean the repo | `dotnet build` and `npm run build` |
| 2 | Backend: one file per class, clear folders | `dotnet build`, `dotnet test` |
| 3 | Frontend: folders, constants, API files | `npm run build` |
| 4 | Frontend: reusable components | `npm run build` |
| 5 | Frontend: pages and Sustainabyte theme | open the app and click through |
| 6 | JWT login and roles: backend | Swagger, 401 / 403 |
| 7 | JWT login and roles: frontend | log in as Admin and as Viewer |
| 8 | Redis caching | app works with and without Redis |
| 9 | Tests | `dotnet test`, `npm test` |
| 10 | Migrations and README | clone-and-run works |

---

## Prompt 0: Working rules

````
Rules for everything you do in this project:

1. Do NOT ask me questions. If something is unclear, choose the simplest option, do it, and list your assumptions at the end.
2. Finish the whole task in one go. Do not stop to ask for confirmation.
3. Write simple code a junior developer can read: clear names, short methods (under 25 lines), no clever tricks.
4. Do NOT use advanced patterns: no repository layer, no unit of work, no CQRS, no MediatR, no decorators, no generic base classes, no reflection. Services use the database context directly.
5. One class, record, enum or interface per file. The file name equals the type name.
6. Do not change existing API routes or JSON shapes unless the task says so.
7. Do not add libraries unless the task names them.
8. Remove unused code and unused imports. Do not leave commented-out code.
9. At the end run the check commands for the task, fix any errors, then print: the files you created, the files you changed, and your assumptions.

Project: Equipment Monitoring for Sustainabyte Technologies.
Backend: ASP.NET Core 8, EF Core, PostgreSQL, MQTTnet, SignalR.
Frontend: React 18 + Vite + Tailwind + Recharts.
Simulator: Node script (MQTT). No Docker.
````

---

## Prompt 1: Clean the repo

````
Clean the repository. Do not change any logic.

1. The project is inside a nested folder. Move everything up so the repo root has: backend/, frontend/, simulator/, README.md and one .gitignore (merge the two .gitignore files, remove duplicates). Use `git mv`.
2. Delete the Docker files: docker-compose.yml, backend/Dockerfile, frontend/Dockerfile, frontend/.dockerignore, simulator/Dockerfile, and the mosquitto/ folder. Remove Docker text from the README.
3. Frontend is Vite, so remove Next.js leftovers: delete `"use client"` lines and frontend/jsconfig.json. Change the title in frontend/index.html to "Sustainabyte · Equipment Monitor".
4. Stop tracking frontend/.env (`git rm --cached frontend/.env`), add `.env` to .gitignore, keep frontend/.env.example.
5. Move frontend/components and frontend/lib into frontend/src and fix all imports.
6. Create backend/EquipmentMonitoring.sln containing the Api and Tests projects.
7. Delete unused imports and unused usings.
8. Keep package-lock.json files.

Check: `dotnet build` in backend/, `npm run build` in frontend/.
````

---

## Prompt 2: Backend, one file per class

````
Reorganize backend/EquipmentMonitoring.Api so every class, record, enum and interface is in its own file inside a clear folder. Do not change behaviour. Namespaces must match folders.

Final structure:

EquipmentMonitoring.Api/
  Program.cs
  appsettings.json
  Controllers/
    EquipmentController.cs
    AlertsController.cs
  Models/                      (database entities; rename the old Domain folder)
    Equipment.cs
    Reading.cs
    Alert.cs
    Threshold.cs
  Enums/
    EquipmentStatus.cs
    AlertStatus.cs
    BreachKind.cs
  Dtos/
    EquipmentRequest.cs
    EquipmentDto.cs
    ReadingInput.cs
    IngestRequest.cs
    IngestResult.cs
    ReadingDto.cs
    ReadingBroadcastItem.cs
    ReadingsBroadcast.cs
    AlertDto.cs
  Mappings/
    MappingExtensions.cs       (the ToDto extension methods, currently inside Dtos.cs)
  Data/
    AppDbContext.cs
    DbSeeder.cs
  Services/
    Interfaces/
      IEquipmentService.cs
      IReadingService.cs
      IAlertService.cs
      IRealtimeNotifier.cs
    EquipmentService.cs
    ReadingService.cs
    AlertService.cs
    ThresholdEvaluator.cs
    Breach.cs
  Exceptions/
    NotFoundException.cs
    ConflictException.cs
    BadRequestException.cs
  Middleware/
    GlobalExceptionHandler.cs
  Hubs/
    EquipmentHub.cs
    SignalRNotifier.cs
  Mqtt/
    MqttOptions.cs
    MqttSubscriberService.cs

Steps:
- Split the grouped files (Entities.cs, Dtos.cs, Interfaces.cs, Errors.cs, EquipmentHub.cs, MqttSubscriberService.cs) into the files above.
- In ReadingService, split the long IngestAsync method into small private methods with clear names (for example SaveReadings, FindThreshold, CreateAlertIfNeeded, SendLiveUpdates). Keep the behaviour: at most one unresolved alert per equipment + metric + breach direction.
- Add a short summary comment above each service class and above each public method in the interfaces. No other comments needed.
- Update the Tests project namespaces so the tests still pass.

Check: `dotnet build` and `dotnet test` from backend/.
````

---

## Prompt 3: Frontend folders, constants and API files

````
Reorganize frontend/src. Do not change how the app looks or works in this step.

Create this structure:

src/
  main.jsx
  App.jsx
  api/
    client.js                 (the fetch helper, moved from lib/api.js)
    equipmentApi.js           (getEquipment, createEquipment, updateEquipment, getReadings)
    alertsApi.js              (getAlerts, acknowledgeAlert, resolveAlert)
  constants/
    metrics.js                (LIMITS, UNITS, METRIC_NAMES)
    statuses.js               (STATUSES list and the colour classes for each status)
  utils/
    format.js                 (formatNumber, formatTime)
    readings.js               (rowsFromHistory and addSample: the code that turns readings into table/chart rows)
  hooks/
    useEquipmentData.js       (renamed from lib/useEquipmentHub.js; loads data with the api files)
    useSignalR.js             (only the live connection: connect, retry, and call handlers when events arrive)
  components/
  pages/

Steps:
- Move the code. In useEquipmentData, call functions from equipmentApi.js / alertsApi.js instead of calling api("/api/...") directly. useEquipmentData uses useSignalR for live updates.
- Move LIMITS, UNITS, STATUSES and colour classes out of EquipmentDashboard.jsx into the constants files and import them.
- Keep EquipmentDashboard.jsx working for now (it will be split in the next prompts).
- Use plain React: useState, useEffect, custom hooks. Do not add Redux, Zustand or any state library.

Check: `npm run build`, then run the app and confirm the dashboard still loads and updates live.
````

---

## Prompt 4: Frontend reusable components

````
Create reusable components in frontend/src/components/ by extracting repeated UI from EquipmentDashboard.jsx. Each component is a small function component in its own file (under 60 lines), takes props, and has no API calls and no business logic. Use Tailwind classes. Use the same look as today.

Create exactly these files:

components/Button.jsx          props: variant ("primary" | "secondary"), onClick, disabled, children
components/StatusBadge.jsx     props: status           (coloured pill with a dot and the status text)
components/AlertCountBadge.jsx props: count            (red "N Active Alerts" tag; shows "No alerts" when 0)
components/StatCard.jsx        props: label, value, dotClass, selected, onClick   (status count card)
components/MetricValue.jsx     props: metric, value    (number + unit; red and bold when above the limit)
components/Modal.jsx           props: title, onClose, children   (overlay, close button, closes on Escape)
components/FormField.jsx       props: label, children  (label wrapping an input or select)
components/EmptyState.jsx      props: message
components/ErrorMessage.jsx    props: message
components/Loading.jsx         props: text
components/PageHeader.jsx      props: eyebrow, title, highlight, subtitle, children   (centered header: small green label, big title with one green word)
components/Navbar.jsx          props: activePage, alertCount, isLive, onNavigate
components/Footer.jsx          (the line "Connected by IoT. Driven by AI. Built for Net Zero.")

Then create the feature components (also one file each, props only):

components/EquipmentTable.jsx      props: equipment, readings, activeAlerts, onSelect, onEdit
components/EquipmentRow.jsx        props: item, latestReading, alertCount, onSelect, onEdit
components/EquipmentForm.jsx       props: item, onSave, onClose       (add/edit form inside Modal, with validation messages)
components/MetricChart.jsx         props: data, metric             (Recharts line chart with the red limit line)
components/MetricTabs.jsx          props: latest, selectedMetric, onSelect
components/ReadingsTable.jsx       props: rows
components/AlertHistoryList.jsx    props: alerts
components/AlertCard.jsx           props: alert, equipmentName, onAcknowledge, onResolve, onOpen

Rules:
- Replace every duplicated piece of markup in EquipmentDashboard.jsx with these components. The same status badge, button, and value display must never be written twice.
- Keep EquipmentDashboard.jsx only as the place that holds page state until Prompt 5 splits it into pages.
- Do not use inline styles except where Recharts needs them.

Check: `npm run build`, and the app looks and works the same.
````

---

## Prompt 5: Frontend pages and Sustainabyte theme

````
Split EquipmentDashboard.jsx into pages and apply the Sustainabyte look (sustainabyte.ai). Use plain React: App.jsx keeps one piece of state, `page` ("dashboard" | "detail" | "alerts"), and `selectedId`. Do not add react-router.

Create:
pages/DashboardPage.jsx         (PageHeader, row of StatCards that filter by status, EquipmentTable, "Add equipment" button, EquipmentForm in a Modal)
pages/EquipmentDetailPage.jsx   (back link, header with StatusBadge and Edit button, MetricTabs, MetricChart, ReadingsTable, AlertHistoryList)
pages/AlertsPage.jsx            (PageHeader, list of AlertCard, "All clear" EmptyState, short list of recently resolved alerts)

App.jsx: calls useEquipmentData(), shows Navbar, the current page, Footer. Shows Loading while loading and ErrorMessage on errors. Delete EquipmentDashboard.jsx when empty.

Theme (put colours in tailwind.config.js as `brand`):
  navy #0B1B47, navy2 #12214F, mint #22E5A0, green #2FBF71, ink #0F1B3D. Font: Plus Jakarta Sans.
- Page background is WHITE.
- Navbar is navy with a 2px mint-to-green line on top: "SUSTAINABYTE" wordmark, small mint "EQUIPMENT MONITOR" under it, tabs "Equipment" and "Active alerts" (red count badge). The active tab has a mint underline. "Live" indicator on the right.
- Page headers are centered: tiny uppercase green label, big bold navy title with one green word (for example "Equipment **Intelligence**", "Active **alerts**").
- Status StatCards: white, soft shadow, rounded-2xl, big green number. Selected card has a green ring.
- AlertCard: Open = light red background with red border, Acknowledged = light amber, "All clear" = light green.
- The chart sits inside a rounded navy panel (mint line, faint grid, red dashed limit line). Everything else stays white.
- Fully responsive down to 360px; the table scrolls sideways inside its own box.

Check: `npm run build`, then open the app and click through every page on desktop and mobile width.
````

---

## Prompt 6: JWT login and roles (backend)

````
Add JWT login with two roles, Admin and Viewer. Keep it simple.

Package to add: BCrypt.Net-Next (for password hashing). Also Microsoft.AspNetCore.Authentication.JwtBearer.

Create:
- Enums/UserRole.cs            (Admin, Viewer)
- Models/User.cs               (Id, Email, DisplayName, PasswordHash, Role)
- Dtos/LoginRequest.cs         (Email, Password, both required)
- Dtos/LoginResponse.cs        (AccessToken, ExpiresAt, Email, DisplayName, Role)
- Services/Interfaces/IAuthService.cs and Services/AuthService.cs
      Login(email, password): find the user, check the password with BCrypt.Verify, return a LoginResponse.
      Wrong email or wrong password both throw UnauthorizedException with the SAME message "Invalid email or password."
- Services/Interfaces/ITokenService.cs and Services/TokenService.cs
      Creates a JWT with claims: user id, email, name, role. Expires after Jwt:ExpiryMinutes (default 60).
- Exceptions/UnauthorizedException.cs (and handle it in GlobalExceptionHandler as 401)
- Controllers/AuthController.cs
      POST /api/auth/login (anonymous) returns LoginResponse. GET /api/auth/me (any logged-in user).

Changes:
- AppDbContext: add DbSet<User>, unique index on Email, store Role as string.
- DbSeeder: if there are no users, add admin@sustainabyte.local (Admin) and viewer@sustainabyte.local (Viewer). Passwords come from configuration keys Seed:AdminPassword and Seed:ViewerPassword.
- appsettings.json: add a "Jwt" section (Issuer, Audience, ExpiryMinutes) and leave Jwt:Key empty. Put a development Jwt:Key (at least 32 characters) and the two seed passwords in appsettings.Development.json. On startup, if Jwt:Key is missing or shorter than 32 characters, stop with a clear error message.
- Program.cs: AddAuthentication().AddJwtBearer(...) validating issuer, audience, lifetime and signing key. Add app.UseAuthentication() before app.UseAuthorization().
- Authorization:
    All controllers require login: put [Authorize] on them.
    Viewer can only read (all GET endpoints).
    Admin can also create, update, delete equipment, ingest readings by HTTP, and acknowledge/resolve alerts: put [Authorize(Roles = "Admin")] on those actions.
    Use a small static class `Roles` with constants "Admin" and "Viewer" instead of typing the strings everywhere.
- SignalR: [Authorize] on EquipmentHub. Browsers send the token in the query string for WebSockets, so in JwtBearerEvents.OnMessageReceived read `access_token` from the query when the path starts with /hubs.
- 401 and 403 responses must return the same JSON error format as the other errors (ProblemDetails).
- Swagger: add the Bearer "Authorize" button.
- MQTT ingestion is not an HTTP call, so it stays open as it is.

Add unit tests: AuthService (right password works, wrong password and unknown email give the same error), TokenService (token contains the role claim).

Check: `dotnet build`, `dotnet test`. In Swagger: no token gives 401; Viewer token on DELETE gives 403; Admin token works.
````

---

## Prompt 7: JWT login and roles (frontend)

````
Add login to the frontend. Plain React, no new libraries, no react-router.

Create:
- api/authApi.js                 login(email, password) calls POST /api/auth/login
- context/AuthContext.jsx        the only React context in the project. Holds { user, token }. Functions: login, logout. Saves the session in sessionStorage and restores it on page load.
- hooks/useAuth.js               returns the AuthContext value
- pages/LoginPage.jsx            centered white card, Sustainabyte wordmark, email and password fields (use FormField and Button), error message under the form (ErrorMessage), button shows "Signing in..." while loading, Enter key submits
- utils/roles.js                 export const isAdmin = (user) => user?.role === "Admin"

Changes:
- main.jsx wraps <App /> in AuthProvider.
- App.jsx: if there is no logged-in user, show LoginPage; otherwise show the app.
- api/client.js: add the header `Authorization: Bearer <token>` when a token exists. On a 401 response (except for the login call) call logout so the user returns to the login page with the message "Your session expired. Please sign in again."
- useSignalR.js: connect only when logged in and pass `accessTokenFactory: () => token`. Disconnect on logout.
- Navbar: show the user's email, a small role badge ("Admin" mint, "Viewer" gray) and a Logout button.
- Hide these for Viewers using isAdmin(user): "Add equipment" button, the edit pencil in EquipmentRow, and the Acknowledge / Resolve buttons in AlertCard. (The backend also blocks them. Hiding is only for a cleaner screen.)
- Never put the password or token in console.log.

Add a "Demo accounts" section to README.md with the two seed emails.

Check: `npm run build`. Log in as Admin: everything is visible. Log in as Viewer: no add/edit/acknowledge/resolve buttons.
````

---

## Prompt 8: Redis caching

Redis without Docker on Windows: use WSL (`sudo apt install redis-server`, then `sudo service redis-server start`), or Memurai Developer Edition, or a free hosted Redis (Upstash, Redis Cloud). The prompt makes Redis optional, so the app also runs without it.

````
Add caching with Redis. The app must still work when Redis is not installed.

Package: Microsoft.Extensions.Caching.StackExchangeRedis.

Create:
- Services/Interfaces/ICacheService.cs   with: Task<T?> GetAsync<T>(string key), Task SetAsync<T>(string key, T value, TimeSpan ttl), Task RemoveAsync(string key)
- Services/CacheService.cs               uses IDistributedCache and System.Text.Json. Every method is wrapped in try/catch: if the cache fails, log a warning and carry on (return null for GetAsync). The cache must never crash a request. Log "Cache hit: {key}" and "Cache miss: {key}" at Debug level.
- Services/CacheKeys.cs                  constants: EquipmentList = "equipment:list", DashboardSummary = "dashboard:summary", and a method EquipmentById(int id).
- Dtos/DashboardSummaryDto.cs            TotalEquipment, CountsByStatus (dictionary status -> count), ActiveAlerts, OpenAlerts, AcknowledgedAlerts.
- Services/Interfaces/IDashboardService.cs and Services/DashboardService.cs   builds the summary from the database.
- Controllers/DashboardController.cs     GET /api/dashboard/summary (any logged-in user).

Changes:
- Program.cs: if configuration "Redis:ConnectionString" has a value, call AddStackExchangeRedisCache with it. Otherwise call AddDistributedMemoryCache and log "Redis not configured, using in-memory cache". Register ICacheService.
- appsettings.json: add "Redis": { "ConnectionString": "" }. Locally use "localhost:6379" in appsettings.Development.json only if Redis is installed.
- EquipmentService: GetAll and GetById read from the cache first (60 seconds), otherwise load from the database and store. Create, Update and Delete remove EquipmentList, the item's key and DashboardSummary.
- DashboardService caches the summary for 15 seconds. ReadingService (when it creates an alert) and AlertService (when the status changes) remove DashboardSummary.
- Do NOT cache reading history. It changes every 2 seconds.

Frontend: DashboardPage loads GET /api/dashboard/summary for the status cards on first load (add getDashboardSummary to api/equipmentApi.js). If the call fails, fall back to counting from the equipment list. Live updates continue to work as before.

Tests: CacheService returns null and does not throw when the underlying cache throws; EquipmentService Create removes the list key.

README: add a Redis section (three ways to run it, the setting name, and "works without Redis").

Check: `dotnet build`, `dotnet test`. Run with Redis: second GET /api/equipment logs "Cache hit". Stop Redis: the API still answers.
````

---

## Prompt 9: Tests

````
Add simple, readable tests. Use Arrange / Act / Assert. No mocking libraries: for ReadingService and AlertService tests use the EF Core InMemory provider (add Microsoft.EntityFrameworkCore.InMemory to the Tests project) and a tiny FakeNotifier class that records calls.

Backend (xUnit), in EquipmentMonitoring.Tests:
- ThresholdEvaluatorTests: above max, below min, exactly on the limit is safe, no limits.
- ReadingServiceTests: a breach creates one alert; a second breach of the same metric while the first is unresolved creates none; after Resolve a new breach creates a new alert; unknown equipment throws NotFoundException.
- AlertServiceTests: Open to Acknowledged to Resolved works; Resolved to anything throws ConflictException; acknowledging twice throws ConflictException.

Frontend: add devDependencies vitest, @testing-library/react, @testing-library/jest-dom, jsdom, and a "test" script ("vitest run"). Configure the test environment in vite.config.js.
- StatusBadge.test.jsx: shows the status text for each status.
- AlertCard.test.jsx: shows the Acknowledge button for an Open alert, hides it for an Acknowledged alert.
- utils/readings.test.js: rowsFromHistory keeps the previous value when a metric is missing.

Check: `dotnet test` and `npm test` both pass.
````

---

## Prompt 10: Migrations and README

````
Finalize for submission.

1. Migrations: remove the EnsureCreated fallback from DbSeeder. Create the first migration (`dotnet ef migrations add InitialCreate`), commit the Migrations folder, and make startup call MigrateAsync and then seed the demo data when the tables are empty.

2. Rewrite README.md with these sections in this order:
   - What the project does (short paragraph)
   - How it works (simulator -> MQTT -> API -> PostgreSQL and SignalR -> React), as a small text diagram
   - What to install: .NET 8 SDK, Node 20, PostgreSQL 16, Mosquitto, Redis (optional), with Windows notes
   - How to run: backend, simulator, frontend (exact commands)
   - Settings table: every configuration key, its default, what it does
   - Demo accounts and what Admin and Viewer can do (small table)
   - REST API table (include login and dashboard summary)
   - MQTT message format
   - Alert rules
   - Project structure (folder tree)
   - Running the tests
   - Known limitations and next steps
   No emojis.

3. Quick audit: list any file over 150 lines, any method over 30 lines, any endpoint without [Authorize], any committed secret, any TODO or unused file. Fix the safe ones and list the rest.

4. Show `git status` and confirm bin/, obj/, node_modules/ and .env are not tracked.
````
