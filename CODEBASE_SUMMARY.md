# Codebase Summary

This document provides an overview of key functions and variables used throughout the project. It serves as a reference to maintain consistency in naming and functionality.

## API Routes

- `/api/assignments`: GET, POST
- `/api/users`: GET, POST
- `/api/sync-statuses`: POST
- `/api/check-user-statuses`: GET
- `/api/reset-total-hours`: POST
- `/api/recalculate-total-hours`: POST
- `/api/work-distribution`: GET
- `/api/health`: GET
- `/api/test-config`: GET
- `/api/debug-url`: GET
- `/api/test-url`: GET
- `/api/verify-config`: GET

## Database Operations (app/actions.ts)

- `fetchAssignments()`
- `createAssignment(assignment: Omit<Assignment, "id">)`
- `updateAssignment(assignment: Assignment)`
- `updateAssignments(assignments: Assignment[])`
- `deleteAssignment(id: number)`
- `fetchUsers()`
- `createUser(user: Partial<Omit<User, "id">>)`
- `updateUser(user: User)`
- `updateUsers(users: User[])`
- `deleteUser(userId: number)`
- `updateUserTotalHours(userId: number)`
- `resetAllUsersTotalHours()`
- `recalculateAllUsersTotalHours()`
- `createWorkLog(workLog: Omit<WorkLog, "id" | "created_at" | "updated_at">)`
- `getUserIdByName(name: string)`

## Utility Functions

- `getBaseUrl()` (lib/utils/get-base-url.ts)
- `updateTeamStatus(teamLead, members, assignmentType, assignmentStatus, assignmentLocation)` (lib/utils/user-status.ts)
- `updateUserStatusFromAssignment(userName, assignmentType, assignmentStatus, assignmentLocation)` (lib/utils/user-status.ts)
- `syncUserStatuses()` (lib/utils/user-status.ts)
- `calculateTotalHours(assignments, dateRange)` (lib/utils/hour-calculations.ts)
- `calculateHoursByType(assignments, dateRange)` (lib/utils/hour-calculations.ts)

## Hooks

- `useUsers()` (hooks/use-users.ts)
- `useAssignments()` (hooks/use-assignments.ts)
- `useToast()` (components/ui/use-toast.ts)

## Components

- `DashboardClient`
- `EnvStatus`
- `MainNav`
- `SideNav`
- `AssignmentCard`
- `UserCard`
- `EditAssignmentDialog`
- `EditUserDialog`
- `NewAssignmentDialog`
- `AddUserDialog`
- `ConfirmDeleteDialog`
- `ConfirmFinalizatDialog`
- `UserHoursTable`
- `LogHoursDialog`
- `UserWorkLogs`
- `WorkerStats`
- `TopWorkers`
- `WorkDistribution`
- `DateRangePicker`

## Types (lib/db/types.ts)

- `Assignment`
- `User`
- `WorkLog`

## Environment Variables

- `VERCEL_URL`
- `NEXT_PUBLIC_VERCEL_URL`
- `DATABASE_URL`
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

## Constants

- `requiredEnvVars` (lib/config.ts)

## Important Note

When making changes or additions to the codebase, please refer to this summary to maintain consistency in naming conventions and functionality. If new functions or significant variables are added, update this summary accordingly.

