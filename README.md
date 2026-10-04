# Sustainabyte Equipment Monitoring

An industrial IoT telemetry monitoring and alert management platform. It ingests machine telemetry across factories in real time, evaluates operational thresholds, triggers alerts with deduplication, broadcasts updates via WebSockets, and provides role-based access control with caching resilience.

## How it Works

```
[IoT Simulator (Node.js)]
         |
         | MQTT (Topic: equipment/{id}/readings)
         v
  [Mosquitto Broker]
         |
         v
[ASP.NET Core API (MqttSubscriberService)]
    |--> ThresholdEvaluator (Detects Min/Max breaches)
    |--> EF Core / PostgreSQL (Persists equipment, readings, alerts, users)
    |--> Redis / Memory Cache (Caches equipment, dashboard summary)
    |--> SignalR Hub (/hubs/equipment)
              |
              | WebSockets (Real-time telemetry & alert stream)
              v
     [React SPA Dashboard]
```

## What to Install

- .NET 8 SDK: Version 8.0 or later.
- Node.js: Version 20 LTS or later (with npm).
- PostgreSQL: Version 16 or later (listening on port 5432).
- Mosquitto MQTT Broker: Version 2.0 or later (listening on port 1883).
- Redis (Optional): Version 6 or later (listening on port 6379).

Windows Notes:
- Mosquitto can be installed using Windows installer or chocolatey (`choco install mosquitto`). Run with `mosquitto -c mosquitto/mosquitto.conf -v`.
- Redis can be run via WSL (`sudo apt install redis-server && sudo service redis-server start`), native Memurai Developer Edition, or managed cloud instances (Upstash, Redis Cloud). If Redis is not running or unconfigured, the backend automatically uses an in-memory distributed cache fallback. When Redis is enabled, connect/sync timeouts are set to 1000ms with `AbortOnConnectFail = false` to prevent API freezing during outages.
- PostgreSQL can be installed via Windows installer with default port 5432 and postgres user.

## How to Run

1. Start Mosquitto and PostgreSQL services on localhost.

2. Start the Backend API:
```bash
cd backend/EquipmentMonitoring.Api
dotnet run
```
API runs at http://localhost:5000 (Swagger available at http://localhost:5000/swagger). Database migrations and initial seed data are applied automatically on startup.

3. Start the Industrial Telemetry Simulator:
```powershell
cd simulator
npm install
$env:SIM_EMAIL="viewer@sustainabyte.local"; $env:SIM_PASSWORD="ViewerPassword123!"; npm start
```
The simulator dynamically authenticates with the backend API, discovers all registered machines, and broadcasts live MQTT telemetry packets every 2 seconds.

4. Start the Frontend Dashboard:
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:3000 in your browser.

## Configuration Settings

The following configuration settings are defined in `backend/EquipmentMonitoring.Api/appsettings.json` and `appsettings.Development.json`:

| Configuration Key | Default Value | Description |
|---|---|---|
| `ConnectionStrings:Default` | `Host=localhost;Port=5432;Database=equipment;Username=postgres;Password=postgres` | PostgreSQL database connection string. |
| `Mqtt:Host` | `localhost` | Hostname of the MQTT broker. |
| `Mqtt:Port` | `1883` | TCP port of the MQTT broker. |
| `Mqtt:Topic` | `equipment/+/readings` | MQTT topic wildcard subscription pattern for telemetry ingestion. |
| `Cors:Origins` | `["http://localhost:3000", "http://localhost:5173"]` | Allowed CORS origins for browser web applications. |
| `Jwt:Issuer` | `Sustainabyte` | JWT token issuer claim. |
| `Jwt:Audience` | `EquipmentMonitoring` | JWT token audience claim. |
| `Jwt:Key` | `sustainabyte-equipment-monitoring-secret-key-2026-chennai-aiot` (Development) | Secret HMAC signing key (minimum 32 characters required). |
| `Jwt:ExpiryMinutes` | `60` | Lifespan of issued JWT access tokens in minutes. |
| `Redis:ConnectionString` | `""` | Connection string for Redis distributed cache. Leave empty for in-memory fallback. |
| `Seed:AdminPassword` | `AdminPassword123!` | Initial password seeded for the default Administrator account. |
| `Seed:ViewerPassword` | `ViewerPassword123!` | Initial password seeded for the default Viewer account. |

### Simulator Environment Variables

The IoT simulator (`simulator/simulator.js`) requires valid credentials to authenticate with the backend API and discover monitored machines:

| Variable | Required? | Default Value | Description |
|---|---|---|---|
| `SIM_EMAIL` | **Yes** | — | Viewer or Admin user email for API authentication. |
| `SIM_PASSWORD` | **Yes** | — | User password for API authentication. |
| `API_BASE` | Optional | `http://localhost:5000` | Backend REST API base URL. |
| `MQTT_URL` | Optional | `mqtt://localhost:1883` | Mosquitto broker connection URL. |
| `INTERVAL_MS` | Optional | `2000` | Telemetry broadcast interval in milliseconds. |
| `SYNC_INTERVAL_MS` | Optional | `30000` | Inventory refresh interval in milliseconds. |

**PowerShell Execution Example:**
```powershell
$env:SIM_EMAIL="viewer@sustainabyte.local"; $env:SIM_PASSWORD="ViewerPassword123!"; npm start
```

### Telemetry Rules per Status

| Equipment Status | Telemetry Behavior | Runtime Counter |
|---|---|---|
| `Active` | Normal profile values by machine type with slight jitter and 3% operational spike probability. | Increases continuously. |
| `Faulty` | Abnormally elevated values (temperature +14°C, vibration +2.5 mm/s) triggering threshold breach alerts. | Increases continuously. |
| `Idle` | Low resting baseline (temp ~28°C, vib ~0.1 mm/s, pressure ~40 psi staying above 30 psi limit). | Stationary (does not increase). |
| `UnderMaintenance` | No telemetry messages published (paused). | Stationary (does not increase). |

## Demo Accounts

The database automatically seeds two default accounts with distinct authorization levels:

| Role | Email | Password | Permissions |
|---|---|---|---|
| Admin | `admin@sustainabyte.local` | `AdminPassword123!` | Full permissions: create, edit, delete equipment, ingest HTTP readings, acknowledge and resolve alerts. |
| Viewer | `viewer@sustainabyte.local` | `ViewerPassword123!` | Read-only permissions: view live equipment statuses, telemetry graphs, and active/resolved alerts. |

Self-registered users are always Viewers. Admin accounts are seeded.

## REST API Reference

All endpoints except authentication and health checks require an `Authorization: Bearer <token>` header.

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Anonymous | Authenticates credentials and returns JWT access token. |
| POST | `/api/auth/register` | Anonymous | Registers a new viewer account and returns JWT access token. |
| GET | `/api/auth/me` | Authenticated | Returns information about the authenticated user. |
| GET | `/api/dashboard/summary` | Authenticated | Returns cached overall plant summary and equipment counts by status. |
| GET | `/api/equipment` | Authenticated | Lists all monitored equipment records. |
| POST | `/api/equipment` | Admin | Registers a new equipment record. |
| GET | `/api/equipment/{id}` | Authenticated | Retrieves detailed information for a single equipment record. |
| PUT | `/api/equipment/{id}` | Admin | Updates an existing equipment record. |
| DELETE | `/api/equipment/{id}` | Admin | Deletes an equipment record. |
| GET | `/api/equipment/{id}/readings` | Authenticated | Retrieves historical telemetry readings with optional query filters (from, to, metric, limit). |
| POST | `/api/equipment/{id}/readings` | Admin | Ingests telemetry readings directly over HTTP. |
| GET | `/api/equipment/{id}/alerts` | Authenticated | Retrieves alert history for a specific machine. |
| GET | `/api/alerts` | Authenticated | Retrieves active alerts across all plant equipment (query parameter activeOnly=true). |
| PATCH | `/api/alerts/{id}/acknowledge` | Admin | Updates alert lifecycle status to Acknowledged. |
| PATCH | `/api/alerts/{id}/resolve` | Admin | Updates alert lifecycle status to Resolved. |
| GET | `/health` | Anonymous | Service health probe returning operational status. |

Deleting equipment also deletes its readings, alerts and thresholds.

Standard error responses follow RFC 7807 ProblemDetails specification (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict).

## MQTT Telemetry Format

Machines publish telemetry to topic `equipment/{id}/readings` in JSON format:

```json
{
  "timestamp": "2026-10-04T10:00:00Z",
  "readings": [
    { "metric": "temperature", "value": 72.4, "unit": "°C" },
    { "metric": "vibration", "value": 2.1, "unit": "mm/s" },
    { "metric": "pressure", "value": 105.8, "unit": "kPa" }
  ]
}
```

## Alert Rules

Threshold rules are evaluated deterministically by `ThresholdEvaluator`:
- Upper Limit: Value strictly greater than Max triggers a Max breach.
- Lower Limit: Value strictly less than Min triggers a Min breach.
- Boundary Values: Values equal to Min or Max limits remain within safe operating tolerance.
- Alert Deduplication: At most one unresolved (Open or Acknowledged) alert is permitted per equipment, metric, and breach kind. Subsequent breach readings for an already-open alert do not duplicate records. Once marked Resolved, new breaches trigger new alerts.

## Project Structure

```
equipment-monitoring/
|-- .github/
|   `-- workflows/
|       `-- ci.yml                # GitHub Actions CI workflow (backend & frontend)
|-- .editorconfig                 # Multi-language editor formatting rules
|-- .gitattributes                # Consistent line ending normalisation
|-- backend/
|   |-- EquipmentMonitoring.sln
|   |-- EquipmentMonitoring.Api/
|   |   |-- Constants/            # Domain role, cache, and policy constants
|   |   |-- Controllers/          # REST API HTTP endpoints
|   |   |-- Data/                 # EF Core DbContext, Seeder, Entity configurations
|   |   |-- Dtos/                 # Data transfer records and request payloads
|   |   |-- Enums/                # Domain enumeration definitions
|   |   |-- Exceptions/           # Domain exception classes
|   |   |-- Extensions/           # Service registration and configuration helpers
|   |   |-- Helpers/              # Date/time and utility extension methods
|   |   |-- Hubs/                 # SignalR hub and real-time notifier implementations
|   |   |-- Mappings/             # Entity-to-DTO conversion extension methods
|   |   |-- Middleware/           # Global exception handling and problem details
|   |   |-- Migrations/           # EF Core database schema migrations
|   |   |-- Models/               # Persistent database entity models
|   |   |-- Mqtt/                 # MQTT client service, parser, and options
|   |   |-- Rules/                # Telemetry breach and threshold evaluator rules
|   |   |-- Services/             # Ingestion, query, auth, cache implementations
|   |   |-- appsettings.json
|   |   `-- Program.cs
|   `-- EquipmentMonitoring.Tests/ # xUnit test suites and test doubles
|-- frontend/
|   |-- src/
|   |   |-- api/                  # API clients and HTTP transport
|   |   |-- components/
|   |   |   |-- alerts/           # AlertCard, AlertHistoryList, AlertFilterTabs, ResolvedAlertsList
|   |   |   |-- auth/             # ProtectedRoute
|   |   |   |-- equipment/        # EquipmentTable, EquipmentRow, EquipmentForm, MetricChart, etc.
|   |   |   |-- layout/           # AppLayout, AuthLayout, Sidebar, PageToolbar, Footer, UserBadge
|   |   |   `-- ui/               # Button, Card, Modal, StatCard, StatusBadge, LiveIndicator, etc.
|   |   |-- constants/            # Metric definitions, navigation items, status themes
|   |   |-- context/              # Authentication context and provider
|   |   |-- hooks/                # React hooks for SignalR, auth, query params, deletions
|   |   |-- pages/                # Dashboard, Equipment Detail, Alerts, Login, Register pages
|   |   |-- store/                # Redux Toolkit store and feature slices (equipment, alerts, readings)
|   |   |-- test/                 # Test setup and mocks
|   |   `-- utils/                # Formatting, filtering, validation, and role utilities
|   |-- .prettierrc               # Prettier code formatting configuration
|   |-- eslint.config.js          # ESLint flat configuration
|   |-- package.json
|   `-- vite.config.js
|-- mosquitto/
|   `-- mosquitto.conf            # Mosquitto broker listener and security configuration
|-- simulator/
|   |-- config.js                 # Environment configuration and validation
|   |-- apiClient.js              # Authenticated REST API client with auto-reauth
|   |-- telemetry.js              # Type-based telemetry generators (pure functions)
|   |-- simulator.js              # Main background loop and MQTT publisher
|   `-- package.json
`-- README.md
```

## Code Conventions

- **C# / Backend:**
  - Files and types use `PascalCase` (e.g., `ReadingIngestionService.cs`, `ThresholdEvaluator`).
  - Interfaces use `I` prefix (e.g., `IReadingIngestionService`, `IAuthService`).
  - Asynchronous methods use the `Async` suffix (e.g., `IngestAsync`, `GetEquipmentByIdAsync`).
- **React / Frontend:**
  - Component files use `PascalCase.jsx` (e.g., `StatCard.jsx`, `EquipmentTable.jsx`).
  - Custom React hooks use `useXxx.js` (e.g., `useQueryParam.js`, `useSignalR.js`).
  - Constants use `UPPER_SNAKE_CASE` (e.g., `NAVIGATION_ITEMS`, `STATUS_COLORS`).
  - Test files sit next to the file under test as `Name.test.jsx` or `name.test.js`.

## Frontend State

Application state is managed globally using Redux Toolkit.
The centralized store combines three distinct feature slices:
- equipment: Equipment catalog items, loading status, and error states.
- alerts: Active and resolved anomaly breach alerts with deduplication.
- readings: Rolling telemetry history by equipment ID (buffered up to 60 samples).

## Running the Tests

To run the backend test suite:
```bash
dotnet test backend/EquipmentMonitoring.Tests
```

To run the frontend test suite and lint checks:
```bash
cd frontend
npm run lint
npm test
```

## Known Limitations and Next Steps

1. Multi-factor Authentication: Current authentication relies on single-factor JWT credentials. Future iterations could add TOTP MFA.
2. Historical Telemetry Partitioning: In large-scale deployments, PostgreSQL TimescaleDB or timescale hypertable partitioning is recommended for readings exceeding tens of millions of rows.
3. Machine Learning Anomaly Detection: Current alerts use deterministic static thresholds. Adding statistical rolling-window anomaly models (e.g., z-score, Isolation Forest) would enable predictive maintenance before physical breaches occur.
4. Granular User Management: User management is currently performed via seed scripts. An administrative management UI for creating and modifying user roles dynamically would be beneficial.
5. The equipment list is not paginated; for large fleets add server-side filtering and paging.

