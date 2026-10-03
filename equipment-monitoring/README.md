# PlantWatch: Equipment Monitoring & Management

ASP.NET Core 8 + EF Core + PostgreSQL · MQTT (Mosquitto) · SignalR · Next.js 14 + React + Tailwind

```
simulator (Node) --MQTT--> Mosquitto --> API (MqttSubscriberService)
                                          |-> ReadingService: save readings, evaluate thresholds, open alerts
                                          |-> SignalR hub /hubs/equipment --> Next.js dashboard (live updates)
Next.js --REST--> API --EF Core--> PostgreSQL
```

## Run everything (Docker)
```bash
docker compose up --build
```
Dashboard http://localhost:3000 · API + Swagger http://localhost:5000/swagger · MQTT localhost:1883

The API creates the schema and seeds 5 machines plus default thresholds on first start. The simulator then publishes readings every 2s and machine #1 runs hot, so alerts appear within a minute.

## Run locally (no Docker for the apps)
```bash
docker compose up postgres mosquitto            # infrastructure only
cd backend/EquipmentMonitoring.Api && dotnet run  # http://localhost:5000 (see launchSettings) or set ASPNETCORE_URLS
cd simulator && npm install && npm start
cd frontend && npm install && cp .env.example .env.local && npm run dev
```
If the API listens on a different port, update `NEXT_PUBLIC_API_URL`. Allowed browser origins are set in `Cors:Origins`.

## Database: migrations and seed
On startup `DbSeeder` runs `Migrate()` if migrations exist, otherwise `EnsureCreated()`, then seeds demo data once (only when the Equipment table is empty). To use real migrations:
```bash
cd backend/EquipmentMonitoring.Api
dotnet tool install --global dotnet-ef
dotnet ef migrations add InitialCreate
dotnet ef database update
```
Tables: `Equipment`, `Readings` (one row per metric, indexed by equipment+timestamp), `Alerts`, `Thresholds` (global default per metric; a row with an `EquipmentId` overrides it).

## MQTT contract
Topic `equipment/{id}/readings`, payload:
```json
{ "timestamp": "2026-10-03T10:00:00Z",
  "readings": [ { "metric": "temperature", "value": 71.2, "unit": "°C" } ] }
```
Default limits: temperature max 85, vibration max 7, pressure 30 to 120.

## REST API
| Method | Route | Purpose |
|---|---|---|
| GET/POST | `/api/equipment` | list / register |
| GET/PUT/DELETE | `/api/equipment/{id}` | read / update / delete |
| GET | `/api/equipment/{id}/readings?from&to&metric&limit` | history with date-range filter |
| POST | `/api/equipment/{id}/readings` | ingest over HTTP (same pipeline as MQTT) |
| GET | `/api/equipment/{id}/alerts` | alert history |
| GET | `/api/alerts?activeOnly=true` | active alerts |
| PATCH | `/api/alerts/{id}/acknowledge` · `/resolve` | change alert status |

Errors use RFC 7807 problem details: 400 validation, 404 unknown id, 409 invalid alert transition.

## Alert rules
A value strictly above Max or strictly below Min is a breach (`ThresholdEvaluator`, unit tested). At most one unresolved alert exists per equipment + metric + direction, so a sustained breach doesn't flood the list. Resolve it and the next breach opens a new one.

## SignalR events (server to client)
`ReadingsReceived`, `AlertTriggered`, `AlertUpdated`.

## Tests
```bash
dotnet test backend/EquipmentMonitoring.Tests
```

## Structure and known gaps
`backend/EquipmentMonitoring.Api`: Controllers (HTTP only) → Services (business rules, behind interfaces) → Data (EF Core). `IRealtimeNotifier` keeps SignalR out of the services. The UI lives in `frontend/components/EquipmentDashboard.jsx`, with data and SignalR in `frontend/lib/useEquipmentHub.js`.

Not done (time-boxed): JWT/roles, Redis caching, frontend component tests, hosted demo, splitting the dashboard file into one file per component.
