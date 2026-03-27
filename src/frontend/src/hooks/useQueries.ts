import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Hotel,
  Player,
  PlayerRoomAssignment,
  Room,
  SupportStaff,
  Task,
  Team,
  TeamHotelAssignment,
  TeamTransport,
} from "../backend.d";
import { useActor } from "./useActor";

// ---------------------------------------------------------------------------
// Sample data (used when backend has no list endpoints for these resources)
// ---------------------------------------------------------------------------
const SAMPLE_TEAMS: Team[] = [
  {
    id: "team-001",
    name: "Chicago Bulls",
    sport: "Basketball",
    playerCount: 15n,
    staffCount: 0n,
  },
  {
    id: "team-002",
    name: "LA Lakers",
    sport: "Basketball",
    playerCount: 15n,
    staffCount: 0n,
  },
  {
    id: "team-003",
    name: "Boston Celtics",
    sport: "Basketball",
    playerCount: 15n,
    staffCount: 0n,
  },
  {
    id: "team-004",
    name: "Miami Heat",
    sport: "Basketball",
    playerCount: 15n,
    staffCount: 0n,
  },
  {
    id: "team-005",
    name: "Golden State Warriors",
    sport: "Basketball",
    playerCount: 15n,
    staffCount: 0n,
  },
  {
    id: "team-006",
    name: "New York Knicks",
    sport: "Basketball",
    playerCount: 15n,
    staffCount: 0n,
  },
];

const SAMPLE_TASKS: Task[] = [
  {
    id: "t1",
    description: "Hotel check-in coordination",
    assignedTo: "Ops Team",
    dueDate: BigInt(Date.now() + 86400000),
  },
  {
    id: "t2",
    description: "Transport scheduling",
    assignedTo: "Logistics",
    dueDate: BigInt(Date.now() + 172800000),
  },
  {
    id: "t3",
    description: "Meal prep briefing",
    assignedTo: "Nutrition",
    dueDate: BigInt(Date.now() + 43200000),
  },
  {
    id: "t4",
    description: "Security sweep",
    assignedTo: "Security",
    dueDate: BigInt(Date.now() + 21600000),
  },
  {
    id: "t5",
    description: "Media accreditation",
    assignedTo: "Media Officer",
    dueDate: BigInt(Date.now() + 259200000),
  },
  {
    id: "t6",
    description: "Equipment check",
    assignedTo: "Equipment Mgr",
    dueDate: BigInt(Date.now() + 36000000),
  },
];

// ---------------------------------------------------------------------------
// Hotels
// ---------------------------------------------------------------------------
export function useGetHotels() {
  const { actor, isFetching } = useActor();
  return useQuery<Hotel[]>({
    queryKey: ["hotels"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllHotels();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddHotel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (hotel: Hotel) => {
      if (!actor) throw new Error("No actor");
      await actor.addHotel(hotel);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hotels"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Rooms
// ---------------------------------------------------------------------------
export function useGetAvailableRooms() {
  const { actor, isFetching } = useActor();
  return useQuery<Room[]>({
    queryKey: ["availableRooms"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllAvailableRooms();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddRoom() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (room: Room) => {
      if (!actor) throw new Error("No actor");
      await actor.addRoom(room);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availableRooms"] });
    },
  });
}

export function useBookRoom() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      teamId,
      roomId,
    }: { teamId: string; roomId: bigint }) => {
      if (!actor) throw new Error("No actor");
      return actor.bookRoom(teamId, roomId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availableRooms"] });
    },
  });
}

export function useCancelBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      roomId,
      teamId,
    }: { roomId: bigint; teamId: string }) => {
      if (!actor) throw new Error("No actor");
      await actor.cancelBooking(roomId, teamId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availableRooms"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------
export function useGetTasks() {
  return useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: async () => SAMPLE_TASKS,
  });
}

export function useAddTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (task: Task) => {
      if (!actor) throw new Error("No actor");
      await actor.addTask(task);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useCancelTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => {
      if (!actor) throw new Error("No actor");
      await actor.cancelTask(taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------
export function useGetNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () =>
      [] as {
        id: string;
        message: string;
        resolved: boolean;
        timestamp: bigint;
        type: string;
      }[],
  });
}

// ---------------------------------------------------------------------------
// Teams
// ---------------------------------------------------------------------------
export function useGetTeams() {
  const { actor, isFetching } = useActor();
  return useQuery<Team[]>({
    queryKey: ["teams"],
    queryFn: async () => {
      if (!actor) return SAMPLE_TEAMS;
      try {
        const allStaff = await actor.getAllSupportStaff();
        return SAMPLE_TEAMS.map((team) => ({
          ...team,
          staffCount: BigInt(
            allStaff.filter(([, s]) => s.teamId === team.id).length,
          ),
        }));
      } catch {
        return SAMPLE_TEAMS;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

// ---------------------------------------------------------------------------
// Support Staff
// ---------------------------------------------------------------------------
export function useGetSupportStaffByTeam(teamId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<SupportStaff[]>({
    queryKey: ["supportStaff", teamId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSupportStaffByTeam(teamId);
    },
    enabled: !!actor && !isFetching && !!teamId,
  });
}

export function useAddSupportStaff() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (staff: SupportStaff) => {
      if (!actor) throw new Error("No actor");
      await actor.addSupportStaff(staff);
    },
    onSuccess: (_data, staff) => {
      queryClient.invalidateQueries({
        queryKey: ["supportStaff", staff.teamId],
      });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}

export function useRemoveSupportStaff() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      staffId,
      teamId,
    }: { staffId: string; teamId: string }) => {
      if (!actor) throw new Error("No actor");
      await actor.removeSupportStaff(staffId);
      return teamId;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["supportStaff", variables.teamId],
      });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Team Transport
// ---------------------------------------------------------------------------
export function useGetTeamTransport(teamId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<TeamTransport | null>({
    queryKey: ["transport", teamId],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getTeamTransport(teamId);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!teamId,
  });
}

export function useAddTeamTransport() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (transport: TeamTransport) => {
      if (!actor) throw new Error("No actor");
      await actor.addTeamTransport(transport);
    },
    onSuccess: (_data, transport) => {
      queryClient.invalidateQueries({
        queryKey: ["transport", transport.teamId],
      });
    },
  });
}

export function useUpdateTransportAvailability() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      teamId,
      available,
    }: { teamId: string; available: boolean }) => {
      if (!actor) throw new Error("No actor");
      await actor.updateTransportAvailability(teamId, available);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["transport", variables.teamId],
      });
    },
  });
}

export function useRemoveTeamTransport() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (teamId: string) => {
      if (!actor) throw new Error("No actor");
      await actor.removeTeamTransport(teamId);
      return teamId;
    },
    onSuccess: (_data, teamId) => {
      queryClient.invalidateQueries({ queryKey: ["transport", teamId] });
    },
  });
}

// ---------------------------------------------------------------------------
// Team Hotel Assignment
// ---------------------------------------------------------------------------
export function useGetTeamHotelAssignment(teamId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<TeamHotelAssignment | null>({
    queryKey: ["hotelAssignment", teamId],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getTeamHotelAssignment(teamId);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!teamId,
  });
}

export function useAssignHotelToTeam() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      teamId,
      hotelId,
    }: { teamId: string; hotelId: string }) => {
      if (!actor) throw new Error("No actor");
      await actor.assignHotelToTeam(teamId, hotelId);
      return teamId;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["hotelAssignment", variables.teamId],
      });
    },
  });
}

export function useRemoveTeamHotelAssignment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (teamId: string) => {
      if (!actor) throw new Error("No actor");
      await actor.removeTeamHotelAssignment(teamId);
      return teamId;
    },
    onSuccess: (_data, teamId) => {
      queryClient.invalidateQueries({ queryKey: ["hotelAssignment", teamId] });
    },
  });
}

// ---------------------------------------------------------------------------
// Players
// ---------------------------------------------------------------------------
// Players
// ---------------------------------------------------------------------------

export function useGetPlayersByTeam(teamId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Player[]>({
    queryKey: ["players", teamId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPlayersByTeam(teamId);
    },
    enabled: !!actor && !isFetching && !!teamId,
  });
}

export function useAddPlayer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (player: Player) => {
      if (!actor) throw new Error("No actor");
      await actor.addPlayer(player);
      return player;
    },
    onSuccess: (_data, player) => {
      queryClient.invalidateQueries({ queryKey: ["players", player.teamId] });
    },
  });
}

export function useUpdatePlayer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (player: Player) => {
      if (!actor) throw new Error("No actor");
      await actor.updatePlayer(player);
      return player;
    },
    onSuccess: (_data, player) => {
      queryClient.invalidateQueries({ queryKey: ["players", player.teamId] });
    },
  });
}

export function useRemovePlayer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      playerId,
      teamId,
    }: { playerId: string; teamId: string }) => {
      if (!actor) throw new Error("No actor");
      await actor.removePlayer(playerId);
      return teamId;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["players", variables.teamId],
      });
    },
  });
}

export function useGetPlayerRoomAssignments(teamId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<PlayerRoomAssignment[]>({
    queryKey: ["playerRooms", teamId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPlayerRoomAssignments(teamId);
    },
    enabled: !!actor && !isFetching && !!teamId,
  });
}

export function useAssignPlayerRoom() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (assignment: PlayerRoomAssignment) => {
      if (!actor) throw new Error("No actor");
      await actor.assignPlayerRoom(assignment);
      return assignment;
    },
    onSuccess: (_data, assignment) => {
      queryClient.invalidateQueries({
        queryKey: ["playerRooms", assignment.teamId],
      });
    },
  });
}

// ---------------------------------------------------------------------------
// User Role Assignment (admin only)
// ---------------------------------------------------------------------------
export function useAssignUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      principal,
      role,
    }: { principal: string; role: string }) => {
      if (!actor) throw new Error("No actor");
      const { Principal } = await import("@icp-sdk/core/principal");
      const { UserRole } = await import("../backend");
      const p = Principal.fromText(principal);
      const roleVal =
        role === "admin"
          ? UserRole.admin
          : role === "coach"
            ? UserRole.user
            : UserRole.guest;
      await actor.assignCallerUserRole(p, roleVal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerRole"] });
    },
  });
}

export function useGetUserProfileByPrincipal() {
  const { actor } = useActor();
  return async (principal: string) => {
    if (!actor) return null;
    const { Principal } = await import("@icp-sdk/core/principal");
    const p = Principal.fromText(principal);
    return actor.getUserProfile(p);
  };
}
