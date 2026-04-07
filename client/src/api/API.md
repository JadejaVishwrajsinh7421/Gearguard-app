# GearGuard API Documentation

Complete reference for all API endpoints and types used in the GearGuard application.

---

## Base Configuration

```
Base URL: /api
Headers: Content-Type: application/json
```

---

## Health Check

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/health` | Check if API is running |

---

## Equipment Endpoints

### GET All Equipments
```
GET /api/equipments
Params: Optional filters
Returns: Equipment[]
```

### GET Equipment by ID
```
GET /api/equipments/:id
Params: id (string | number)
Returns: Equipment
```

### GET Equipment Stats
```
GET /api/equipments/stats
Returns: Stats object
```

### CREATE Equipment
```
POST /api/equipments
Body: Partial<Equipment>
Returns: Equipment
```

### UPDATE Equipment
```
PUT /api/equipments/:id
Params: id (string | number)
Body: Partial<Equipment>
Returns: Equipment
```

### DELETE Equipment
```
DELETE /api/equipments/:id
Params: id (string | number)
Returns: void
```

**Equipment Type:**
```typescript
{
  id: number;
  name: string;
  type: string;
  location: string;
  status: 'operational' | 'maintenance' | 'retired';
  purchase_date: string;
  cost: number;
  created_at: string;
  updated_at: string;
}
```

---

## Maintenance Endpoints

### GET All Maintenance Requests
```
GET /api/maintenance
Params: Optional filters
Returns: MaintenanceRequest[]
```

### GET Maintenance Request by ID
```
GET /api/maintenance/:id
Params: id (string | number)
Returns: MaintenanceRequest
```

### GET Kanban Data
```
GET /api/maintenance/kanban
Returns: Kanban data object
```

### GET Maintenance Stats
```
GET /api/maintenance/stats
Returns: Stats object
```

### GET Calendar Events
```
GET /api/maintenance/calendar
Params: Optional filters
Returns: Calendar events array
```

### CREATE Maintenance Request
```
POST /api/maintenance
Body: Partial<MaintenanceRequest>
Returns: MaintenanceRequest
```

### UPDATE Maintenance Request
```
PUT /api/maintenance/:id
Params: id (string | number)
Body: Partial<MaintenanceRequest>
Returns: MaintenanceRequest
```

### UPDATE Maintenance Stage
```
PATCH /api/maintenance/:id/stage
Params: id (string | number)
Body: { stage: string }
Returns: MaintenanceRequest
```

### DELETE Maintenance Request
```
DELETE /api/maintenance/:id
Params: id (string | number)
Returns: void
```

**MaintenanceRequest Type:**
```typescript
{
  id: number;
  equipment_id: number;
  team_id: number;
  title: string;
  description: string;
  stage: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  scheduled_date: string;
  completed_date?: string;
  created_at: string;
  updated_at: string;
}
```

---

## Teams Endpoints

### GET All Teams
```
GET /api/teams
Returns: Team[]
```

### GET Team by ID
```
GET /api/teams/:id
Params: id (string | number)
Returns: Team
```

### CREATE Team
```
POST /api/teams
Body: Partial<Team>
Returns: Team
```

### UPDATE Team
```
PUT /api/teams/:id
Params: id (string | number)
Body: Partial<Team>
Returns: Team
```

### DELETE Team
```
DELETE /api/teams/:id
Params: id (string | number)
Returns: void
```

**Team Type:**
```typescript
{
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}
```

---

## Users Endpoints

### GET All Users
```
GET /api/users
Returns: User[]
```

### GET User by ID
```
GET /api/users/:id
Params: id (string | number)
Returns: User
```

### CREATE User
```
POST /api/users
Body: Partial<User>
Returns: User
```

### UPDATE User
```
PUT /api/users/:id
Params: id (string | number)
Body: Partial<User>
Returns: User
```

### DELETE User
```
DELETE /api/users/:id
Params: id (string | number)
Returns: void
```

**User Type:**
```typescript
{
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'technician' | 'manager' | 'viewer';
  phone?: string;
  created_at: string;
  updated_at: string;
}
```

---

## Common Response Format

All API responses follow this structure:

```typescript
{
  success: boolean;
  message?: string;
  data?: T;
  timestamp?: string;
}
```

### Success Response Example
```json
{
  "success": true,
  "message": "Equipment retrieved successfully",
  "data": { /* Equipment object */ },
  "timestamp": "2026-04-07T10:30:00.000Z"
}
```

### Error Response Example
```json
{
  "success": false,
  "message": "Equipment not found",
  "timestamp": "2026-04-07T10:30:00.000Z"
}
```

---

## Quick Reference Table

| Resource | Endpoint | Method | Description |
|----------|----------|--------|-------------|
| **Equipment** | `/api/equipments` | GET | Get all equipments |
| | `/api/equipments/:id` | GET | Get equipment by ID |
| | `/api/equipments/stats` | GET | Get equipment statistics |
| | `/api/equipments` | POST | Create new equipment |
| | `/api/equipments/:id` | PUT | Update equipment |
| | `/api/equipments/:id` | DELETE | Delete equipment |
| **Maintenance** | `/api/maintenance` | GET | Get all requests |
| | `/api/maintenance/:id` | GET | Get request by ID |
| | `/api/maintenance/kanban` | GET | Get kanban board data |
| | `/api/maintenance/stats` | GET | Get maintenance statistics |
| | `/api/maintenance/calendar` | GET | Get calendar events |
| | `/api/maintenance` | POST | Create new request |
| | `/api/maintenance/:id` | PUT | Update request |
| | `/api/maintenance/:id/stage` | PATCH | Update request stage |
| | `/api/maintenance/:id` | DELETE | Delete request |
| **Teams** | `/api/teams` | GET | Get all teams |
| | `/api/teams/:id` | GET | Get team by ID |
| | `/api/teams` | POST | Create new team |
| | `/api/teams/:id` | PUT | Update team |
| | `/api/teams/:id` | DELETE | Delete team |
| **Users** | `/api/users` | GET | Get all users |
| | `/api/users/:id` | GET | Get user by ID |
| | `/api/users` | POST | Create new user |
| | `/api/users/:id` | PUT | Update user |
| | `/api/users/:id` | DELETE | Delete user |
| **Health** | `/api/health` | GET | Check API status |

---

## Usage Example

```javascript
// Import from api client
import { 
  getEquipments, 
  createEquipment, 
  updateEquipment,
  deleteEquipment 
} from './api/index.js';

// Get all equipments
const response = await getEquipments({ status: 'operational' });
console.log(response.data);

// Create new equipment
const newEquipment = await createEquipment({
  name: 'Compressor',
  type: 'Air Compressor',
  location: 'Warehouse A',
  status: 'operational',
  cost: 5000
});

// Update equipment
await updateEquipment(1, { status: 'maintenance' });

// Delete equipment
await deleteEquipment(1);
```
