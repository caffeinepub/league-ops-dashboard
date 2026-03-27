import Map "mo:core/Map";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Array "mo:core/Array";

actor {
  // Initialize the user system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  type SupportStaff = {
    id : Text;
    teamId : Text;
    name : Text;
    role : Text;
    addedAt : Time.Time;
  };

  module SupportStaff {
    public func compare(staff1 : SupportStaff, staff2 : SupportStaff) : Order.Order {
      Text.compare(staff1.id, staff2.id);
    };
  };

  type TeamTransport = {
    id : Text;
    teamId : Text;
    vehicleRegNumber : Text;
    driverName : Text;
    driverPhone : Text;
    driverAvailable : Bool;
  };

  type TeamHotelAssignment = {
    teamId : Text;
    hotelId : Text;
  };

  type Team = {
    id : Text;
    name : Text;
    sport : Text;
    playerCount : Nat;
    staffCount : Nat;
  };

  module Team {
    public func compare(team1 : Team, team2 : Team) : Order.Order {
      Text.compare(team1.id, team2.id);
    };
  };

  type Hotel = {
    id : Text;
    name : Text;
    address : Text;
    capacity : Nat;
    available : Bool;
  };

  type Room = {
    number : Nat;
    beds : Nat;
    isAvailable : Bool;
  };

  type Task = {
    id : Text;
    description : Text;
    assignedTo : Text;
    dueDate : Time.Time;
  };

  type Notification = {
    id : Text;
    message : Text;
    timestamp : Time.Time;
  };

  type Booking = {
    roomId : Nat;
    teamId : Text;
  };

  type BookingInternal = {
    bookings : [Booking];
  };

  type HotelContact = {
    id : Text;
    hotelId : Text;
    contactType : Text;
    name : Text;
    phone : Text;
    remarks : Text;
  };

  type Player = {
    id : Text;
    teamId : Text;
    name : Text;
    jerseyNumber : Text;
    position : Text;
  };

  type PlayerRoomAssignment = {
    playerId : Text;
    teamId : Text;
    hotelId : Text;
    roomNumber : Text;
  };

  let teams = Map.empty<Text, Team>();
  let hotels = Map.empty<Text, Hotel>();
  let rooms = Map.empty<Nat, Room>();
  let pendingTasks = Map.empty<Text, Task>();
  let notifications = Map.empty<Text, Notification>();
  var bookingCounter = 0;
  var bookingMapping = Map.empty<Nat, BookingInternal>();
  let supportStaff = Map.empty<Text, SupportStaff>();
  let teamTransports = Map.empty<Text, TeamTransport>();
  let teamHotelAssignments = Map.empty<Text, TeamHotelAssignment>();
  let hotelContacts = Map.empty<Text, HotelContact>();
  let players = Map.empty<Text, Player>();
  let playerRoomAssignments = Map.empty<Text, PlayerRoomAssignment>();

  // -------------------------------------------------------------------------
  // Hotel Contacts
  // -------------------------------------------------------------------------
  public shared ({ caller }) func addHotelContact(contact : HotelContact) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add hotel contacts");
    };
    if (hotelContacts.containsKey(contact.id)) { Runtime.trap("Hotel Contact already exists") };
    hotelContacts.add(contact.id, contact);
  };

  public shared ({ caller }) func updateHotelContact(contact : HotelContact) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update hotel contacts");
    };
    if (not hotelContacts.containsKey(contact.id)) { Runtime.trap("Hotel Contact does not exist") };
    hotelContacts.add(contact.id, contact);
  };

  public shared ({ caller }) func removeHotelContact(contactId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can remove hotel contacts");
    };
    if (not hotelContacts.containsKey(contactId)) { Runtime.trap("Hotel Contact does not exist") };
    hotelContacts.remove(contactId);
  };

  public query ({ caller }) func getHotelContacts(hotelId : Text) : async [HotelContact] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view hotel contacts");
    };
    hotelContacts.values().filter(func(contact) { contact.hotelId == hotelId }).toArray();
  };

  // -------------------------------------------------------------------------
  // Players
  // -------------------------------------------------------------------------
  public shared ({ caller }) func addPlayer(player : Player) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add players");
    };
    if (players.containsKey(player.id)) { Runtime.trap("Player already exists") };
    players.add(player.id, player);
  };

  public shared ({ caller }) func updatePlayer(player : Player) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update players");
    };
    if (not players.containsKey(player.id)) { Runtime.trap("Player does not exist") };
    players.add(player.id, player);
  };

  public shared ({ caller }) func removePlayer(playerId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove players");
    };
    if (not players.containsKey(playerId)) { Runtime.trap("Player does not exist") };
    players.remove(playerId);
  };

  public query ({ caller }) func getPlayersByTeam(teamId : Text) : async [Player] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view players");
    };
    players.values().filter(func(player) { player.teamId == teamId }).toArray();
  };

  // -------------------------------------------------------------------------
  // Player Room Assignments
  // -------------------------------------------------------------------------
  public shared ({ caller }) func assignPlayerRoom(assignment : PlayerRoomAssignment) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can assign player rooms");
    };
    playerRoomAssignments.add(assignment.playerId, assignment);
  };

  public shared ({ caller }) func removePlayerRoomAssignment(playerId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove player room assignments");
    };
    if (not playerRoomAssignments.containsKey(playerId)) { Runtime.trap("Player Room Assignment does not exist") };
    playerRoomAssignments.remove(playerId);
  };

  public query ({ caller }) func getPlayerRoomAssignments(teamId : Text) : async [PlayerRoomAssignment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view player room assignments");
    };
    playerRoomAssignments.values().filter(func(assignment) { assignment.teamId == teamId }).toArray();
  };

  // -------------------------------------------------------------------------
  // Hotel Assignments
  // -------------------------------------------------------------------------
  public shared ({ caller }) func assignHotelToTeam(teamId : Text, hotelId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can assign hotels to teams");
    };
    teamHotelAssignments.add(teamId, { teamId; hotelId });
  };

  public query ({ caller }) func getTeamHotelAssignment(teamId : Text) : async ?TeamHotelAssignment {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view hotel assignments");
    };
    teamHotelAssignments.get(teamId);
  };

  public shared ({ caller }) func removeTeamHotelAssignment(teamId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can remove hotel assignments");
    };
    teamHotelAssignments.remove(teamId);
  };

  // -------------------------------------------------------------------------
  // Transport
  // -------------------------------------------------------------------------
  public shared ({ caller }) func addTeamTransport(transport : TeamTransport) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add team transport");
    };
    teamTransports.add(transport.teamId, transport);
  };

  public query ({ caller }) func getTeamTransport(teamId : Text) : async ?TeamTransport {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view team transport");
    };
    teamTransports.get(teamId);
  };

  public shared ({ caller }) func updateTransportAvailability(teamId : Text, available : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update transport availability");
    };
    switch (teamTransports.get(teamId)) {
      case (null) { Runtime.trap("Transport not found") };
      case (?t) {
        teamTransports.add(teamId, { t with driverAvailable = available });
      };
    };
  };

  public shared ({ caller }) func removeTeamTransport(teamId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can remove team transport");
    };
    teamTransports.remove(teamId);
  };

  // -------------------------------------------------------------------------
  // Support Staff
  // -------------------------------------------------------------------------
  public shared ({ caller }) func addSupportStaff(staff : SupportStaff) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add support staff");
    };
    if (supportStaff.containsKey(staff.id)) { Runtime.trap("Staff already exists") };
    supportStaff.add(staff.id, staff);
  };

  public query ({ caller }) func getSupportStaffByTeam(teamId : Text) : async [SupportStaff] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view support staff");
    };
    supportStaff.values().filter(func(staff) { staff.teamId == teamId }).toArray().sort();
  };

  public query ({ caller }) func getAllSupportStaff() : async [(Text, SupportStaff)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view support staff");
    };
    supportStaff.entries().toArray();
  };

  public shared ({ caller }) func removeSupportStaff(staffId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove support staff");
    };
    if (not supportStaff.containsKey(staffId)) { Runtime.trap("Staff does not exist") };
    supportStaff.remove(staffId);
  };

  public shared ({ caller }) func updateTeamStaffCount(teamId : Text, count : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update team staff count");
    };
    switch (teams.get(teamId)) {
      case (null) { Runtime.trap("Team does not exist") };
      case (?team) {
        let updatedTeam = { team with staffCount = count };
        teams.add(teamId, updatedTeam);
      };
    };
  };

  public shared ({ caller }) func addTeam(team : Team) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add teams");
    };
    if (teams.containsKey(team.id)) { Runtime.trap("Team already exists") };
    teams.add(team.id, team);
  };

  public shared ({ caller }) func addHotel(hotel : Hotel) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add hotels");
    };
    if (hotels.containsKey(hotel.id)) { Runtime.trap("Hotel already exists") };
    hotels.add(hotel.id, hotel);
  };

  public shared ({ caller }) func addRoom(room : Room) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add rooms");
    };
    if (rooms.containsKey(room.number)) { Runtime.trap("Room already exists") };
    rooms.add(room.number, room);
  };

  public query ({ caller }) func getHotel(id : Text) : async ?Hotel {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view hotels");
    };
    hotels.get(id);
  };

  public query ({ caller }) func getAllHotels() : async [Hotel] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view hotels");
    };
    hotels.values().toArray();
  };

  public query ({ caller }) func getAllAvailableRooms() : async [Room] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view available rooms");
    };
    rooms.values().filter(func(room) { room.isAvailable }).toArray();
  };

  public shared ({ caller }) func addTask(task : Task) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add tasks");
    };
    if (pendingTasks.containsKey(task.id)) { Runtime.trap("Task already exists") };
    pendingTasks.add(task.id, task);
  };

  public shared ({ caller }) func addNotification(notification : Notification) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add notifications");
    };
    if (notifications.containsKey(notification.id)) { Runtime.trap("Notification already exists") };
    notifications.add(notification.id, notification);
  };

  public shared ({ caller }) func bookRoom(teamId : Text, roomId : Nat) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can book rooms");
    };
    if (not rooms.containsKey(roomId)) { Runtime.trap("Room does not exist") };
    if (not teams.containsKey(teamId)) { Runtime.trap("Team does not exist") };
    switch (rooms.get(roomId)) {
      case (null) { Runtime.trap("Room does not exist") };
      case (?room) {
        if (not room.isAvailable) { Runtime.trap("Room is already booked") };
        let updatedRoom = { room with isAvailable = false };
        rooms.add(roomId, updatedRoom);
        let booking : Booking = { roomId; teamId };
        let internalBooking = {
          bookings = [booking];
        };
        bookingMapping.add(bookingCounter, internalBooking);
        bookingCounter += 1;
        "Booking successful";
      };
    };
  };

  public shared ({ caller }) func cancelBooking(roomId : Nat, teamId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can cancel bookings");
    };
    if (not rooms.containsKey(roomId)) { Runtime.trap("Room does not exist") };
    switch (rooms.get(roomId)) {
      case (null) { Runtime.trap("Room does not exist") };
      case (?room) {
        if (room.isAvailable) { Runtime.trap("Room is not booked") };
        let updatedRoom = { room with isAvailable = true };
        rooms.add(roomId, updatedRoom);
      };
    };
    if (teams.get(teamId) == null) {
      Runtime.trap("Team does not exist");
    };
    var found = false;
    bookingMapping.forEach(
      func(_k, bookingInternal) {
        var subBookingFound = false;
        let subBookingBookings = bookingInternal.bookings.filter(
          func(booking) {
            if (booking.roomId == roomId) {
              subBookingFound := true;
              false;
            } else {
              true;
            };
          }
        );
        if (subBookingFound) {
          found := true;
        };
      }
    );
    if (not found) {
      Runtime.trap("Booking does not exist");
    };
  };

  public shared ({ caller }) func cancelTask(taskId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can cancel tasks");
    };
    if (not pendingTasks.containsKey(taskId)) { Runtime.trap("Task does not exist") };
    pendingTasks.remove(taskId);
  };

  public shared ({ caller }) func updateTeamPlayerCount(teamId : Text, playerCount : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update team player count");
    };
    switch (teams.get(teamId)) {
      case (null) { Runtime.trap("Team does not exist") };
      case (?team) {
        let updatedTeam = { team with playerCount };
        teams.add(teamId, updatedTeam);
      };
    };
  };

  public shared ({ caller }) func updateTeamName(teamId : Text, name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update team names");
    };
    switch (teams.get(teamId)) {
      case (null) { Runtime.trap("Team does not exist") };
      case (?team) {
        let updatedTeam = { team with name };
        teams.add(teamId, updatedTeam);
      };
    };
  };
};

