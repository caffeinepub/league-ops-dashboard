import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Player {
    id: string;
    name: string;
    jerseyNumber: string;
    teamId: string;
    position: string;
}
export type Time = bigint;
export interface HotelContact {
    id: string;
    contactType: string;
    name: string;
    hotelId: string;
    phone: string;
    remarks: string;
}
export interface Task {
    id: string;
    assignedTo: string;
    dueDate: Time;
    description: string;
}
export interface Room {
    beds: bigint;
    isAvailable: boolean;
    number: bigint;
}
export interface PlayerRoomAssignment {
    playerId: string;
    hotelId: string;
    roomNumber: string;
    teamId: string;
}
export interface TeamHotelAssignment {
    hotelId: string;
    teamId: string;
}
export interface TeamTransport {
    id: string;
    driverPhone: string;
    driverAvailable: boolean;
    vehicleRegNumber: string;
    teamId: string;
    driverName: string;
}
export interface Hotel {
    id: string;
    name: string;
    available: boolean;
    address: string;
    capacity: bigint;
}
export interface Notification {
    id: string;
    message: string;
    timestamp: Time;
}
export interface SupportStaff {
    id: string;
    name: string;
    role: string;
    addedAt: Time;
    teamId: string;
}
export interface UserProfile {
    name: string;
}
export interface Team {
    id: string;
    name: string;
    playerCount: bigint;
    sport: string;
    staffCount: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addHotel(hotel: Hotel): Promise<void>;
    addHotelContact(contact: HotelContact): Promise<void>;
    addNotification(notification: Notification): Promise<void>;
    addPlayer(player: Player): Promise<void>;
    addRoom(room: Room): Promise<void>;
    addSupportStaff(staff: SupportStaff): Promise<void>;
    addTask(task: Task): Promise<void>;
    addTeam(team: Team): Promise<void>;
    addTeamTransport(transport: TeamTransport): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignHotelToTeam(teamId: string, hotelId: string): Promise<void>;
    assignPlayerRoom(assignment: PlayerRoomAssignment): Promise<void>;
    bookRoom(teamId: string, roomId: bigint): Promise<string>;
    cancelBooking(roomId: bigint, teamId: string): Promise<void>;
    cancelTask(taskId: string): Promise<void>;
    getAllAvailableRooms(): Promise<Array<Room>>;
    getAllHotels(): Promise<Array<Hotel>>;
    getAllSupportStaff(): Promise<Array<[string, SupportStaff]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getHotel(id: string): Promise<Hotel | null>;
    getHotelContacts(hotelId: string): Promise<Array<HotelContact>>;
    getPlayerRoomAssignments(teamId: string): Promise<Array<PlayerRoomAssignment>>;
    getPlayersByTeam(teamId: string): Promise<Array<Player>>;
    getSupportStaffByTeam(teamId: string): Promise<Array<SupportStaff>>;
    getTeamHotelAssignment(teamId: string): Promise<TeamHotelAssignment | null>;
    getTeamTransport(teamId: string): Promise<TeamTransport | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    removeHotelContact(contactId: string): Promise<void>;
    removePlayer(playerId: string): Promise<void>;
    removePlayerRoomAssignment(playerId: string): Promise<void>;
    removeSupportStaff(staffId: string): Promise<void>;
    removeTeamHotelAssignment(teamId: string): Promise<void>;
    removeTeamTransport(teamId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateHotelContact(contact: HotelContact): Promise<void>;
    updatePlayer(player: Player): Promise<void>;
    updateTeamName(teamId: string, name: string): Promise<void>;
    updateTeamPlayerCount(teamId: string, playerCount: bigint): Promise<void>;
    updateTeamStaffCount(teamId: string, count: bigint): Promise<void>;
    updateTransportAvailability(teamId: string, available: boolean): Promise<void>;
}
