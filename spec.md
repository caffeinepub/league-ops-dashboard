# League Ops Dashboard

## Current State
- TeamManagement.tsx renders 15 static placeholder player slots (just shows "#1 Player" etc.) without connecting to the backend Player APIs
- Backend already has full Player CRUD: addPlayer, updatePlayer, removePlayer, getPlayersByTeam
- No role-based login system -- the app uses Internet Identity but has no role distinction (Admin, Coach, Player)
- Authorization component not yet selected

## Requested Changes (Diff)

### Add
- Role-based login: users can log in as Super Admin, Admin, Coach, or Player
- After login, their role is stored and controls what they can see/do
- Authorization component wired to manage user roles
- Player roster in team cards: load real players from backend, show name + jersey number per slot
- Inline editing of player name and jersey number directly in the player row
- Add player button (up to 15 per team) with a small form (name, jersey number, position)
- Delete player button per player row

### Modify
- TeamManagement: replace static 15-slot placeholder grid with real data fetched via getPlayersByTeam
- App.tsx: add login/role-select screen before dashboard; show current role in sidebar
- Navigation: restrict edit/add actions to Admin and Super Admin roles; Coach and Player see read-only views

### Remove
- Static Array.from({ length: 15 }) placeholder player rendering

## Implementation Plan
1. Select `authorization` Caffeine component
2. Wire authorization into App.tsx: show login screen with role selection (Super Admin, Admin, Coach, Player); store chosen role in context
3. Update TeamManagement player section: fetch players via getPlayersByTeam, render each with inline-editable name and jersey number fields using updatePlayer API
4. Add "Add Player" form per team card (name, jersey, position) calling addPlayer API
5. Add delete button per player calling removePlayer API
6. Gate add/edit/delete actions on Admin/Super Admin role; Coach and Player see read-only roster
