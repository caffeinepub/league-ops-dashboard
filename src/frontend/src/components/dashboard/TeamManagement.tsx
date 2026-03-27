import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Car,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Shirt,
  Trash2,
  Truck,
  User,
  UserCog,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Hotel, Player, Team, TeamTransport } from "../../backend.d";
import type { AppRole } from "../../hooks/useAuth";
import {
  useAddPlayer,
  useAddSupportStaff,
  useAddTeamTransport,
  useAssignHotelToTeam,
  useGetHotels,
  useGetPlayersByTeam,
  useGetSupportStaffByTeam,
  useGetTeamHotelAssignment,
  useGetTeamTransport,
  useRemovePlayer,
  useRemoveSupportStaff,
  useRemoveTeamHotelAssignment,
  useRemoveTeamTransport,
  useUpdatePlayer,
  useUpdateTransportAvailability,
} from "../../hooks/useQueries";

const PREDEFINED_ROLES = [
  "Head Coach",
  "Assistant Coach",
  "Physiotherapist",
  "Team Doctor",
  "Athletic Trainer",
  "Team Analyst",
  "Security Personnel",
  "Media Officer",
  "Equipment Manager",
  "Team Manager",
  "Nutritionist",
  "Custom",
];

const ROLE_COLOR: Record<
  string,
  { bg: string; color: string; border: string }
> = {
  coaching: {
    bg: "rgba(59,130,246,0.15)",
    color: "#3B82F6",
    border: "rgba(59,130,246,0.3)",
  },
  medical: {
    bg: "rgba(34,197,94,0.15)",
    color: "#22C55E",
    border: "rgba(34,197,94,0.3)",
  },
  logistics: {
    bg: "rgba(245,158,11,0.15)",
    color: "#F59E0B",
    border: "rgba(245,158,11,0.3)",
  },
  security: {
    bg: "rgba(239,68,68,0.15)",
    color: "#EF4444",
    border: "rgba(239,68,68,0.3)",
  },
  other: {
    bg: "rgba(168,85,247,0.15)",
    color: "#A855F7",
    border: "rgba(168,85,247,0.3)",
  },
};

function getRoleCategory(role: string): keyof typeof ROLE_COLOR {
  const r = role.toLowerCase();
  if (r.includes("coach")) return "coaching";
  if (
    r.includes("doctor") ||
    r.includes("physio") ||
    r.includes("medical") ||
    r.includes("trainer") ||
    r.includes("nutritionist")
  )
    return "medical";
  if (r.includes("security")) return "security";
  if (
    r.includes("equipment") ||
    r.includes("manager") ||
    r.includes("media") ||
    r.includes("analyst") ||
    r.includes("transport")
  )
    return "logistics";
  return "other";
}

function getRoleColors(role: string) {
  return ROLE_COLOR[getRoleCategory(role)];
}

// -------------------------------------------------------------------------
// Add Staff inline form
// -------------------------------------------------------------------------
function AddStaffForm({
  teamId,
  onClose,
}: { teamId: string; onClose: () => void }) {
  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [customRole, setCustomRole] = useState("");
  const addStaff = useAddSupportStaff();

  const effectiveRole =
    selectedRole === "Custom" ? customRole.trim() : selectedRole;

  function handleSubmit() {
    if (!name.trim() || !effectiveRole) {
      toast.error("Please fill in all fields");
      return;
    }
    addStaff.mutate(
      {
        id: `staff-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        teamId,
        name: name.trim(),
        role: effectiveRole,
        addedAt: BigInt(Date.now()),
      },
      {
        onSuccess: () => {
          toast.success(`${name.trim()} added as ${effectiveRole}`);
          onClose();
        },
        onError: () => toast.error("Failed to add staff member"),
      },
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
      className="mt-3 p-3 rounded-lg"
      style={{
        background: "rgba(11,19,32,0.8)",
        border: "1px solid rgba(59,130,246,0.2)",
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Plus size={12} style={{ color: "#3B82F6" }} />
        <span
          className="text-[10px] font-bold tracking-widest uppercase"
          style={{ color: "#3B82F6" }}
        >
          Add Support Staff
        </span>
      </div>

      <div className="space-y-2.5">
        {/* Name */}
        <div>
          <Label
            className="text-[9px] font-semibold tracking-widest uppercase mb-1 block"
            style={{ color: "#93A4B8" }}
          >
            Full Name
          </Label>
          <Input
            data-ocid="staff.name.input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter staff name"
            className="h-8 text-[12px]"
            style={{
              background: "#0E1926",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#E6EDF5",
            }}
          />
        </div>

        {/* Role */}
        <div>
          <Label
            className="text-[9px] font-semibold tracking-widest uppercase mb-1 block"
            style={{ color: "#93A4B8" }}
          >
            Role
          </Label>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger
              data-ocid="staff.role.select"
              className="h-8 text-[12px]"
              style={{
                background: "#0E1926",
                border: "1px solid rgba(255,255,255,0.1)",
                color: selectedRole ? "#E6EDF5" : "#93A4B8",
              }}
            >
              <SelectValue placeholder="Select role…" />
            </SelectTrigger>
            <SelectContent
              style={{
                background: "#0E1926",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#E6EDF5",
              }}
            >
              {PREDEFINED_ROLES.map((r) => (
                <SelectItem
                  key={r}
                  value={r}
                  className="text-[12px] cursor-pointer"
                >
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Custom role input */}
        {selectedRole === "Custom" && (
          <div>
            <Label
              className="text-[9px] font-semibold tracking-widest uppercase mb-1 block"
              style={{ color: "#93A4B8" }}
            >
              Custom Role Title
            </Label>
            <Input
              data-ocid="staff.custom_role.input"
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              placeholder="e.g. Video Analyst"
              className="h-8 text-[12px]"
              style={{
                background: "#0E1926",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#E6EDF5",
              }}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button
            data-ocid="staff.add.button"
            size="sm"
            onClick={handleSubmit}
            disabled={addStaff.isPending}
            className="h-7 px-3 text-[11px] font-bold tracking-wide"
            style={{
              background: "rgba(59,130,246,0.2)",
              border: "1px solid rgba(59,130,246,0.4)",
              color: "#3B82F6",
            }}
          >
            {addStaff.isPending ? (
              <Loader2 size={12} className="animate-spin mr-1" />
            ) : (
              <Plus size={12} className="mr-1" />
            )}
            Add Staff
          </Button>
          <Button
            data-ocid="staff.cancel.button"
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="h-7 px-3 text-[11px]"
            style={{ color: "#93A4B8" }}
          >
            <X size={12} className="mr-1" />
            Cancel
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// -------------------------------------------------------------------------
// Transport form
// -------------------------------------------------------------------------
function TransportForm({
  teamId,
  existing,
  onClose,
}: { teamId: string; existing?: TeamTransport | null; onClose: () => void }) {
  const [vehicleRegNumber, setVehicleRegNumber] = useState(
    existing?.vehicleRegNumber ?? "",
  );
  const [driverName, setDriverName] = useState(existing?.driverName ?? "");
  const [driverPhone, setDriverPhone] = useState(existing?.driverPhone ?? "");
  const addTransport = useAddTeamTransport();

  function handleSubmit() {
    if (!vehicleRegNumber.trim() || !driverName.trim() || !driverPhone.trim()) {
      toast.error("Please fill in all transport fields");
      return;
    }
    addTransport.mutate(
      {
        id:
          existing?.id ??
          `transport-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        teamId,
        vehicleRegNumber: vehicleRegNumber.trim(),
        driverName: driverName.trim(),
        driverPhone: driverPhone.trim(),
        driverAvailable: existing?.driverAvailable ?? true,
      },
      {
        onSuccess: () => {
          toast.success("Transport details saved");
          onClose();
        },
        onError: () => toast.error("Failed to save transport details"),
      },
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
      className="mt-3 p-3 rounded-lg"
      style={{
        background: "rgba(11,19,32,0.8)",
        border: "1px solid rgba(245,158,11,0.2)",
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Truck size={12} style={{ color: "#F59E0B" }} />
        <span
          className="text-[10px] font-bold tracking-widest uppercase"
          style={{ color: "#F59E0B" }}
        >
          {existing ? "Edit Transport" : "Add Transport"}
        </span>
      </div>

      <div className="space-y-2.5">
        <div>
          <Label
            className="text-[9px] font-semibold tracking-widest uppercase mb-1 block"
            style={{ color: "#93A4B8" }}
          >
            Vehicle Registration No.
          </Label>
          <Input
            data-ocid="transport.vehicle_reg.input"
            value={vehicleRegNumber}
            onChange={(e) => setVehicleRegNumber(e.target.value)}
            placeholder="e.g. MH 01 AB 1234"
            className="h-8 text-[12px]"
            style={{
              background: "#0E1926",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#E6EDF5",
            }}
          />
        </div>

        <div>
          <Label
            className="text-[9px] font-semibold tracking-widest uppercase mb-1 block"
            style={{ color: "#93A4B8" }}
          >
            Driver Name
          </Label>
          <Input
            data-ocid="transport.driver_name.input"
            value={driverName}
            onChange={(e) => setDriverName(e.target.value)}
            placeholder="Enter driver's full name"
            className="h-8 text-[12px]"
            style={{
              background: "#0E1926",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#E6EDF5",
            }}
          />
        </div>

        <div>
          <Label
            className="text-[9px] font-semibold tracking-widest uppercase mb-1 block"
            style={{ color: "#93A4B8" }}
          >
            Driver Phone
          </Label>
          <Input
            data-ocid="transport.driver_phone.input"
            value={driverPhone}
            onChange={(e) => setDriverPhone(e.target.value)}
            placeholder="e.g. +91 98765 43210"
            className="h-8 text-[12px]"
            style={{
              background: "#0E1926",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#E6EDF5",
            }}
          />
        </div>

        <div className="flex gap-2 pt-1">
          <Button
            data-ocid="transport.save.button"
            size="sm"
            onClick={handleSubmit}
            disabled={addTransport.isPending}
            className="h-7 px-3 text-[11px] font-bold tracking-wide"
            style={{
              background: "rgba(245,158,11,0.2)",
              border: "1px solid rgba(245,158,11,0.4)",
              color: "#F59E0B",
            }}
          >
            {addTransport.isPending ? (
              <Loader2 size={12} className="animate-spin mr-1" />
            ) : (
              <Truck size={12} className="mr-1" />
            )}
            Save
          </Button>
          <Button
            data-ocid="transport.cancel.button"
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="h-7 px-3 text-[11px]"
            style={{ color: "#93A4B8" }}
          >
            <X size={12} className="mr-1" />
            Cancel
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// -------------------------------------------------------------------------
// Transport Section
// -------------------------------------------------------------------------
function TransportSection({
  teamId,
  cardIndex,
}: { teamId: string; cardIndex: number }) {
  const [showForm, setShowForm] = useState(false);
  const { data: transport, isLoading } = useGetTeamTransport(teamId);
  const updateAvailability = useUpdateTransportAvailability();
  const removeTransport = useRemoveTeamTransport();

  function handleToggleAvailability() {
    if (!transport) return;
    updateAvailability.mutate(
      { teamId, available: !transport.driverAvailable },
      {
        onSuccess: () =>
          toast.success(
            `Driver marked as ${!transport.driverAvailable ? "Available" : "Unavailable"}`,
          ),
        onError: () => toast.error("Failed to update availability"),
      },
    );
  }

  function handleRemove() {
    removeTransport.mutate(teamId, {
      onSuccess: () => toast.success("Transport details removed"),
      onError: () => toast.error("Failed to remove transport"),
    });
  }

  return (
    <div className="pt-4">
      {/* Section header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Truck size={10} style={{ color: "#F59E0B" }} />
          <span
            className="text-[9px] font-bold tracking-widest uppercase"
            style={{ color: "#93A4B8" }}
          >
            Transport
          </span>
        </div>
        {!showForm && !transport && !isLoading && (
          <button
            type="button"
            data-ocid={`transport.add.button.${cardIndex}`}
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 px-2 py-1 rounded text-[9px] font-bold tracking-widest uppercase transition-colors hover:bg-white/5"
            style={{ color: "#F59E0B" }}
          >
            <Plus size={9} />
            Add Transport
          </button>
        )}
      </div>

      {isLoading ? (
        <div
          data-ocid={`transport.loading_state.${cardIndex}`}
          className="flex items-center gap-2 py-3"
        >
          <Loader2
            size={12}
            className="animate-spin"
            style={{ color: "#93A4B8" }}
          />
          <span className="text-[11px]" style={{ color: "#93A4B8" }}>
            Loading transport…
          </span>
        </div>
      ) : transport ? (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg p-3"
          style={{
            background: "rgba(245,158,11,0.05)",
            border: "1px solid rgba(245,158,11,0.15)",
          }}
        >
          <div className="space-y-2">
            {/* Vehicle reg */}
            <div className="flex items-center gap-2">
              <Car size={11} style={{ color: "#F59E0B" }} />
              <span
                className="text-[9px] font-semibold tracking-widest uppercase"
                style={{ color: "#93A4B8", minWidth: 68 }}
              >
                Reg No.
              </span>
              <span
                className="text-[12px] font-bold"
                style={{ color: "#E6EDF5" }}
              >
                {transport.vehicleRegNumber}
              </span>
            </div>
            {/* Driver name */}
            <div className="flex items-center gap-2">
              <User size={11} style={{ color: "#F59E0B" }} />
              <span
                className="text-[9px] font-semibold tracking-widest uppercase"
                style={{ color: "#93A4B8", minWidth: 68 }}
              >
                Driver
              </span>
              <span className="text-[12px]" style={{ color: "#E6EDF5" }}>
                {transport.driverName}
              </span>
            </div>
            {/* Driver phone */}
            <div className="flex items-center gap-2">
              <Phone size={11} style={{ color: "#F59E0B" }} />
              <span
                className="text-[9px] font-semibold tracking-widest uppercase"
                style={{ color: "#93A4B8", minWidth: 68 }}
              >
                Phone
              </span>
              <span className="text-[12px]" style={{ color: "#E6EDF5" }}>
                {transport.driverPhone}
              </span>
            </div>
          </div>

          {/* Status + actions row */}
          <div
            className="flex items-center justify-between mt-3 pt-2"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
          >
            <button
              type="button"
              data-ocid={`transport.toggle.${cardIndex}`}
              onClick={handleToggleAvailability}
              disabled={updateAvailability.isPending}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all hover:opacity-80"
              style={{
                background: transport.driverAvailable
                  ? "rgba(34,197,94,0.15)"
                  : "rgba(239,68,68,0.15)",
                border: transport.driverAvailable
                  ? "1px solid rgba(34,197,94,0.35)"
                  : "1px solid rgba(239,68,68,0.35)",
                color: transport.driverAvailable ? "#22C55E" : "#EF4444",
              }}
            >
              {updateAvailability.isPending ? (
                <Loader2 size={9} className="animate-spin" />
              ) : (
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: transport.driverAvailable
                      ? "#22C55E"
                      : "#EF4444",
                  }}
                />
              )}
              {transport.driverAvailable ? "Available" : "Unavailable"}
            </button>

            <div className="flex items-center gap-1">
              <button
                type="button"
                data-ocid={`transport.edit_button.${cardIndex}`}
                onClick={() => setShowForm(true)}
                className="p-1.5 rounded hover:bg-white/5 transition-colors"
                style={{ color: "#93A4B8" }}
              >
                <Plus size={11} />
              </button>
              <button
                type="button"
                data-ocid={`transport.delete_button.${cardIndex}`}
                onClick={handleRemove}
                disabled={removeTransport.isPending}
                className="p-1.5 rounded hover:bg-red-500/10 transition-colors"
                style={{ color: "#EF4444" }}
              >
                {removeTransport.isPending ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : (
                  <Trash2 size={11} />
                )}
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <div
          data-ocid={`transport.empty_state.${cardIndex}`}
          className="py-3 text-center"
        >
          <p className="text-[11px]" style={{ color: "#93A4B8" }}>
            No transport assigned yet
          </p>
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <TransportForm
            teamId={teamId}
            existing={transport}
            onClose={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// -------------------------------------------------------------------------
// Hotel Section
// -------------------------------------------------------------------------
function HotelSection({
  teamId,
  cardIndex,
}: { teamId: string; cardIndex: number }) {
  const [showSelect, setShowSelect] = useState(false);
  const [selectedHotelId, setSelectedHotelId] = useState("");

  const { data: assignment, isLoading: assignmentLoading } =
    useGetTeamHotelAssignment(teamId);
  const { data: hotels = [], isLoading: hotelsLoading } = useGetHotels();
  const assignHotel = useAssignHotelToTeam();
  const removeAssignment = useRemoveTeamHotelAssignment();

  const assignedHotel: Hotel | undefined = assignment
    ? hotels.find((h) => h.id === assignment.hotelId)
    : undefined;

  function handleAssign() {
    if (!selectedHotelId) {
      toast.error("Please select a hotel");
      return;
    }
    assignHotel.mutate(
      { teamId, hotelId: selectedHotelId },
      {
        onSuccess: () => {
          toast.success("Hotel assigned successfully");
          setShowSelect(false);
          setSelectedHotelId("");
        },
        onError: () => toast.error("Failed to assign hotel"),
      },
    );
  }

  function handleRemove() {
    removeAssignment.mutate(teamId, {
      onSuccess: () => toast.success("Hotel assignment removed"),
      onError: () => toast.error("Failed to remove hotel assignment"),
    });
  }

  const isLoading = assignmentLoading || hotelsLoading;

  return (
    <div className="pt-4">
      {/* Section header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Building2 size={10} style={{ color: "#8B5CF6" }} />
          <span
            className="text-[9px] font-bold tracking-widest uppercase"
            style={{ color: "#93A4B8" }}
          >
            Hotel
          </span>
        </div>
        {!showSelect && !assignment && !isLoading && (
          <button
            type="button"
            data-ocid={`hotel.assign.button.${cardIndex}`}
            onClick={() => setShowSelect(true)}
            className="flex items-center gap-1 px-2 py-1 rounded text-[9px] font-bold tracking-widest uppercase transition-colors hover:bg-white/5"
            style={{ color: "#8B5CF6" }}
          >
            <Plus size={9} />
            Assign Hotel
          </button>
        )}
      </div>

      {isLoading ? (
        <div
          data-ocid={`hotel.loading_state.${cardIndex}`}
          className="flex items-center gap-2 py-3"
        >
          <Loader2
            size={12}
            className="animate-spin"
            style={{ color: "#93A4B8" }}
          />
          <span className="text-[11px]" style={{ color: "#93A4B8" }}>
            Loading hotel…
          </span>
        </div>
      ) : assignment ? (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg p-3"
          style={{
            background: "rgba(139,92,246,0.05)",
            border: "1px solid rgba(139,92,246,0.2)",
          }}
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Building2 size={11} style={{ color: "#8B5CF6" }} />
              <span
                className="text-[9px] font-semibold tracking-widest uppercase"
                style={{ color: "#93A4B8", minWidth: 68 }}
              >
                Hotel
              </span>
              <span
                className="text-[12px] font-bold"
                style={{ color: "#E6EDF5" }}
              >
                {assignedHotel?.name ?? assignment.hotelId}
              </span>
            </div>
            {assignedHotel?.address && (
              <div className="flex items-center gap-2">
                <MapPin size={11} style={{ color: "#8B5CF6" }} />
                <span
                  className="text-[9px] font-semibold tracking-widest uppercase"
                  style={{ color: "#93A4B8", minWidth: 68 }}
                >
                  Address
                </span>
                <span className="text-[12px]" style={{ color: "#E6EDF5" }}>
                  {assignedHotel.address}
                </span>
              </div>
            )}
          </div>

          <div
            className="flex items-center justify-between mt-3 pt-2"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
          >
            <span
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase"
              style={{
                background: assignedHotel?.available
                  ? "rgba(34,197,94,0.15)"
                  : "rgba(239,68,68,0.15)",
                border: assignedHotel?.available
                  ? "1px solid rgba(34,197,94,0.35)"
                  : "1px solid rgba(239,68,68,0.35)",
                color: assignedHotel?.available ? "#22C55E" : "#EF4444",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: assignedHotel?.available ? "#22C55E" : "#EF4444",
                }}
              />
              {assignedHotel?.available ? "Available" : "Unavailable"}
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                data-ocid={`hotel.edit_button.${cardIndex}`}
                onClick={() => setShowSelect(true)}
                className="p-1.5 rounded hover:bg-white/5 transition-colors"
                style={{ color: "#93A4B8" }}
              >
                <Plus size={11} />
              </button>
              <button
                type="button"
                data-ocid={`hotel.delete_button.${cardIndex}`}
                onClick={handleRemove}
                disabled={removeAssignment.isPending}
                className="p-1.5 rounded hover:bg-red-500/10 transition-colors"
                style={{ color: "#EF4444" }}
              >
                {removeAssignment.isPending ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : (
                  <Trash2 size={11} />
                )}
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <div
          data-ocid={`hotel.empty_state.${cardIndex}`}
          className="py-3 text-center"
        >
          <p className="text-[11px]" style={{ color: "#93A4B8" }}>
            No hotel assigned yet
          </p>
        </div>
      )}

      {/* Hotel select form */}
      <AnimatePresence>
        {showSelect && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="mt-3 p-3 rounded-lg"
            style={{
              background: "rgba(11,19,32,0.8)",
              border: "1px solid rgba(139,92,246,0.2)",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Building2 size={12} style={{ color: "#8B5CF6" }} />
              <span
                className="text-[10px] font-bold tracking-widest uppercase"
                style={{ color: "#8B5CF6" }}
              >
                Assign Hotel
              </span>
            </div>

            <div className="space-y-2.5">
              <div>
                <Label
                  className="text-[9px] font-semibold tracking-widest uppercase mb-1 block"
                  style={{ color: "#93A4B8" }}
                >
                  Select Hotel
                </Label>
                <Select
                  value={selectedHotelId}
                  onValueChange={setSelectedHotelId}
                >
                  <SelectTrigger
                    data-ocid={`hotel.select.${cardIndex}`}
                    className="h-8 text-[12px]"
                    style={{
                      background: "#0E1926",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: selectedHotelId ? "#E6EDF5" : "#93A4B8",
                    }}
                  >
                    <SelectValue placeholder="Choose a hotel…" />
                  </SelectTrigger>
                  <SelectContent
                    style={{
                      background: "#0E1926",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#E6EDF5",
                    }}
                  >
                    {hotels.map((h) => (
                      <SelectItem
                        key={h.id}
                        value={h.id}
                        className="text-[12px] cursor-pointer"
                      >
                        {h.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  data-ocid={`hotel.save.button.${cardIndex}`}
                  size="sm"
                  onClick={handleAssign}
                  disabled={assignHotel.isPending || !selectedHotelId}
                  className="h-7 px-3 text-[11px] font-bold tracking-wide"
                  style={{
                    background: "rgba(139,92,246,0.2)",
                    border: "1px solid rgba(139,92,246,0.4)",
                    color: "#8B5CF6",
                  }}
                >
                  {assignHotel.isPending ? (
                    <Loader2 size={12} className="animate-spin mr-1" />
                  ) : (
                    <Building2 size={12} className="mr-1" />
                  )}
                  Assign
                </Button>
                <Button
                  data-ocid={`hotel.cancel.button.${cardIndex}`}
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowSelect(false);
                    setSelectedHotelId("");
                  }}
                  className="h-7 px-3 text-[11px]"
                  style={{ color: "#93A4B8" }}
                >
                  <X size={12} className="mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// -------------------------------------------------------------------------
// Player Roster Component
// -------------------------------------------------------------------------
function PlayerRoster({
  teamId,
  cardIndex,
  isAdmin,
}: { teamId: string; cardIndex: number; isAdmin: boolean }) {
  const { data: players = [], isLoading } = useGetPlayersByTeam(teamId);
  const addPlayer = useAddPlayer();
  const updatePlayer = useUpdatePlayer();
  const removePlayer = useRemovePlayer();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editJersey, setEditJersey] = useState("");
  const [newName, setNewName] = useState("");
  const [newJersey, setNewJersey] = useState("");
  const [newPosition, setNewPosition] = useState("");

  function startEdit(player: Player) {
    setEditingId(player.id);
    setEditName(player.name);
    setEditJersey(player.jerseyNumber);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditJersey("");
  }

  function saveEdit(player: Player) {
    if (!editName.trim()) {
      toast.error("Player name is required");
      return;
    }
    updatePlayer.mutate(
      { ...player, name: editName.trim(), jerseyNumber: editJersey.trim() },
      {
        onSuccess: () => {
          toast.success("Player updated");
          cancelEdit();
        },
        onError: () => toast.error("Failed to update player"),
      },
    );
  }

  function handleAdd() {
    if (!newName.trim()) {
      toast.error("Player name is required");
      return;
    }
    addPlayer.mutate(
      {
        id: `player-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        teamId,
        name: newName.trim(),
        jerseyNumber: newJersey.trim(),
        position: newPosition.trim(),
      },
      {
        onSuccess: () => {
          toast.success(`${newName.trim()} added`);
          setNewName("");
          setNewJersey("");
          setNewPosition("");
          setShowAddForm(false);
        },
        onError: () => toast.error("Failed to add player"),
      },
    );
  }

  function handleDelete(playerId: string, playerName: string) {
    removePlayer.mutate(
      { playerId, teamId },
      {
        onSuccess: () => toast.success(`${playerName} removed`),
        onError: () => toast.error("Failed to remove player"),
      },
    );
  }

  return (
    <div className="pt-4">
      <div className="flex items-center justify-between mb-2">
        <div
          className="text-[9px] font-bold tracking-widest uppercase"
          style={{ color: "#93A4B8" }}
        >
          Players ({isLoading ? "…" : players.length}/15)
        </div>
        {isAdmin && !showAddForm && players.length < 15 && (
          <button
            type="button"
            data-ocid={`team.add_player.button.${cardIndex}`}
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1 px-2 py-1 rounded text-[9px] font-bold tracking-widest uppercase transition-colors hover:bg-white/5"
            style={{ color: "#3B82F6" }}
          >
            <Plus size={9} />
            Add Player
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 py-3">
          <Loader2
            size={12}
            className="animate-spin"
            style={{ color: "#93A4B8" }}
          />
          <span className="text-[11px]" style={{ color: "#93A4B8" }}>
            Loading players…
          </span>
        </div>
      ) : players.length === 0 ? (
        <div className="py-3 text-center">
          <p className="text-[11px]" style={{ color: "#93A4B8" }}>
            {isAdmin
              ? 'No players yet. Click "Add Player" to start.'
              : "No players assigned yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {players.map((player, pi) => (
            <div
              key={player.id}
              data-ocid={`team.player.item.${pi + 1}`}
              className="rounded-md group"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              {editingId === player.id ? (
                <div className="flex items-center gap-1.5 p-2">
                  <Input
                    value={editJersey}
                    onChange={(e) => setEditJersey(e.target.value)}
                    placeholder="#"
                    className="h-7 w-14 text-[11px] text-center font-black"
                    style={{
                      background: "#0E1926",
                      border: "1px solid rgba(59,130,246,0.3)",
                      color: "#3B82F6",
                    }}
                  />
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Player name"
                    className="h-7 flex-1 text-[11px]"
                    style={{
                      background: "#0E1926",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#E6EDF5",
                    }}
                    onKeyDown={(e) => e.key === "Enter" && saveEdit(player)}
                  />
                  <button
                    type="button"
                    onClick={() => saveEdit(player)}
                    className="p-1 rounded hover:bg-green-500/20"
                    title="Save"
                  >
                    <Check size={12} style={{ color: "#22C55E" }} />
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="p-1 rounded hover:bg-white/5"
                    title="Cancel"
                  >
                    <X size={12} style={{ color: "#93A4B8" }} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2 py-1.5">
                  <span
                    className="text-[9px] font-black w-8 text-center flex-shrink-0"
                    style={{ color: "#3B82F6" }}
                  >
                    #{player.jerseyNumber || "—"}
                  </span>
                  <span
                    className="text-[10px] flex-1 truncate"
                    style={{ color: "#E6EDF5" }}
                  >
                    {player.name}
                  </span>
                  {player.position && (
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        color: "#93A4B8",
                      }}
                    >
                      {player.position}
                    </span>
                  )}
                  {isAdmin && (
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => startEdit(player)}
                        className="p-1 rounded hover:bg-blue-500/20"
                        title="Edit"
                      >
                        <Pencil size={10} style={{ color: "#3B82F6" }} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(player.id, player.name)}
                        className="p-1 rounded hover:bg-red-500/20"
                        title="Delete"
                      >
                        <Trash2 size={10} style={{ color: "#EF4444" }} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add player form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="mt-3 p-3 rounded-lg"
            style={{
              background: "rgba(11,19,32,0.8)",
              border: "1px solid rgba(59,130,246,0.2)",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Plus size={12} style={{ color: "#3B82F6" }} />
              <span
                className="text-[10px] font-bold tracking-widest uppercase"
                style={{ color: "#3B82F6" }}
              >
                Add Player
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="w-20">
                  <label
                    htmlFor="player-jersey-new"
                    className="text-[9px] font-semibold tracking-widest uppercase mb-1 block"
                    style={{ color: "#93A4B8" }}
                  >
                    Jersey #
                  </label>
                  <Input
                    id="player-jersey-new"
                    value={newJersey}
                    onChange={(e) => setNewJersey(e.target.value)}
                    placeholder="00"
                    className="h-8 text-[12px] text-center"
                    style={{
                      background: "#0E1926",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#E6EDF5",
                    }}
                  />
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="player-name-new"
                    className="text-[9px] font-semibold tracking-widest uppercase mb-1 block"
                    style={{ color: "#93A4B8" }}
                  >
                    Player Name
                  </label>
                  <Input
                    id="player-name-new"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Full name"
                    className="h-8 text-[12px]"
                    style={{
                      background: "#0E1926",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#E6EDF5",
                    }}
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="player-position-new"
                  className="text-[9px] font-semibold tracking-widest uppercase mb-1 block"
                  style={{ color: "#93A4B8" }}
                >
                  Position (optional)
                </label>
                <Input
                  id="player-position-new"
                  value={newPosition}
                  onChange={(e) => setNewPosition(e.target.value)}
                  placeholder="e.g. Point Guard"
                  className="h-8 text-[12px]"
                  style={{
                    background: "#0E1926",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#E6EDF5",
                  }}
                />
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  onClick={handleAdd}
                  disabled={addPlayer.isPending}
                  className="h-7 px-3 text-[11px] font-bold"
                  style={{
                    background: "rgba(59,130,246,0.2)",
                    border: "1px solid rgba(59,130,246,0.4)",
                    color: "#3B82F6",
                  }}
                >
                  {addPlayer.isPending ? (
                    <Loader2 size={12} className="animate-spin mr-1" />
                  ) : (
                    <Plus size={12} className="mr-1" />
                  )}
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewName("");
                    setNewJersey("");
                    setNewPosition("");
                  }}
                  className="h-7 px-3 text-[11px]"
                  style={{ color: "#93A4B8" }}
                >
                  <X size={12} className="mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// -------------------------------------------------------------------------
// Team Card
// -------------------------------------------------------------------------
function TeamCard({
  team,
  index,
  isAdmin,
}: { team: Team; index: number; isAdmin: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const removeStaff = useRemoveSupportStaff();

  const { data: staffList = [], isLoading: staffLoading } =
    useGetSupportStaffByTeam(expanded ? team.id : "");

  function handleRemove(staffId: string) {
    removeStaff.mutate(
      { staffId, teamId: team.id },
      {
        onSuccess: () => toast.success("Staff member removed"),
        onError: () => toast.error("Failed to remove staff member"),
      },
    );
  }

  const staffCount = staffList.length || Number(team.staffCount);

  return (
    <motion.div
      data-ocid={`team.card.${index}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className="rounded-xl overflow-hidden"
      style={{
        background: "#141E2A",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Card header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(59,130,246,0.15)",
                border: "1px solid rgba(59,130,246,0.25)",
              }}
            >
              <Shirt size={16} style={{ color: "#3B82F6" }} />
            </div>
            <div className="min-w-0">
              <h3
                className="text-[13px] font-bold tracking-wide truncate"
                style={{ color: "#E6EDF5" }}
              >
                {team.name}
              </h3>
              <span
                className="text-[10px] font-semibold tracking-widest uppercase"
                style={{ color: "#93A4B8" }}
              >
                {team.sport}
              </span>
            </div>
          </div>

          <button
            type="button"
            data-ocid={`team.expand.toggle.${index}`}
            onClick={() => {
              setExpanded((v) => !v);
              if (expanded) setShowAddForm(false);
            }}
            className="p-1.5 rounded-lg transition-colors hover:bg-white/5 flex-shrink-0"
            style={{ color: "#93A4B8" }}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* Chips */}
        <div className="flex flex-wrap gap-2 mt-3">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase"
            style={{
              background: "rgba(59,130,246,0.12)",
              border: "1px solid rgba(59,130,246,0.25)",
              color: "#3B82F6",
            }}
          >
            <User size={9} />
            15 Players
          </span>
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase"
            style={{
              background: "rgba(34,197,94,0.12)",
              border: "1px solid rgba(34,197,94,0.25)",
              color: "#22C55E",
            }}
          >
            <UserCog size={9} />
            {staffCount} Support Staff
          </span>
        </div>
      </div>

      {/* Expandable body */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: "hidden" }}
          >
            <div
              className="px-4 pb-4"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              {/* Players section */}
              <PlayerRoster
                teamId={team.id}
                cardIndex={index}
                isAdmin={isAdmin}
              />

              {/* Support Staff section */}
              <div className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div
                    className="text-[9px] font-bold tracking-widest uppercase"
                    style={{ color: "#93A4B8" }}
                  >
                    Support Staff ({staffLoading ? "…" : staffList.length})
                  </div>
                  {!showAddForm && (
                    <button
                      type="button"
                      data-ocid={`team.add_staff.button.${index}`}
                      onClick={() => setShowAddForm(true)}
                      className="flex items-center gap-1 px-2 py-1 rounded text-[9px] font-bold tracking-widest uppercase transition-colors hover:bg-white/5"
                      style={{ color: "#3B82F6" }}
                    >
                      <Plus size={9} />
                      Add Staff
                    </button>
                  )}
                </div>

                {staffLoading ? (
                  <div
                    data-ocid={`team.staff.loading_state.${index}`}
                    className="flex items-center gap-2 py-3"
                  >
                    <Loader2
                      size={12}
                      className="animate-spin"
                      style={{ color: "#93A4B8" }}
                    />
                    <span className="text-[11px]" style={{ color: "#93A4B8" }}>
                      Loading staff…
                    </span>
                  </div>
                ) : staffList.length === 0 ? (
                  <div
                    data-ocid={`team.staff.empty_state.${index}`}
                    className="py-3 text-center"
                  >
                    <p className="text-[11px]" style={{ color: "#93A4B8" }}>
                      No support staff assigned yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {staffList.map((staff, si) => {
                      const colors = getRoleColors(staff.role);
                      return (
                        <div
                          key={staff.id}
                          data-ocid={`team.staff.item.${si + 1}`}
                          className="flex items-center gap-2 px-2.5 py-2 rounded-lg group"
                          style={{
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.05)",
                          }}
                        >
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-bold"
                            style={{
                              background: colors.bg,
                              color: colors.color,
                            }}
                          >
                            {staff.name.charAt(0).toUpperCase()}
                          </div>
                          <span
                            className="flex-1 text-[12px] font-medium truncate"
                            style={{ color: "#E6EDF5" }}
                          >
                            {staff.name}
                          </span>
                          <Badge
                            className="text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 flex-shrink-0"
                            style={{
                              background: colors.bg,
                              border: `1px solid ${colors.border}`,
                              color: colors.color,
                            }}
                          >
                            {staff.role}
                          </Badge>
                          <button
                            type="button"
                            data-ocid={`team.staff.delete_button.${si + 1}`}
                            onClick={() => handleRemove(staff.id)}
                            disabled={removeStaff.isPending}
                            className="ml-1 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 flex-shrink-0"
                            style={{ color: "#EF4444" }}
                          >
                            {removeStaff.isPending ? (
                              <Loader2 size={10} className="animate-spin" />
                            ) : (
                              <Trash2 size={10} />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Inline add form */}
                <AnimatePresence>
                  {showAddForm && (
                    <AddStaffForm
                      teamId={team.id}
                      onClose={() => setShowAddForm(false)}
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* Transport section */}
              <TransportSection teamId={team.id} cardIndex={index} />

              {/* Hotel section */}
              <HotelSection teamId={team.id} cardIndex={index} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// -------------------------------------------------------------------------
// Page
// -------------------------------------------------------------------------
export function TeamManagement({
  teams,
  userRole = "guest",
}: { teams: Team[]; userRole?: AppRole }) {
  const isAdmin = userRole === "admin";
  return (
    <div className="p-5 space-y-5">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-start justify-between gap-4"
      >
        <div>
          <h2
            className="text-[20px] font-black tracking-[0.15em] uppercase"
            style={{ color: "#E6EDF5" }}
          >
            Team Allocations
          </h2>
          <p
            className="text-[12px] tracking-wide mt-0.5"
            style={{ color: "#93A4B8" }}
          >
            Manage team rosters and support staff
          </p>
        </div>
        <div
          className="px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase"
          style={{
            background: "rgba(59,130,246,0.12)",
            border: "1px solid rgba(59,130,246,0.25)",
            color: "#3B82F6",
          }}
        >
          {teams.length} Teams
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="grid grid-cols-3 gap-3"
      >
        {[
          { label: "Total Teams", value: teams.length, color: "#3B82F6" },
          {
            label: "Total Players",
            value: teams.length * 15,
            color: "#22C55E",
          },
          {
            label: "Support Staff",
            value: teams.reduce((s, t) => s + Number(t.staffCount), 0),
            color: "#F59E0B",
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="px-4 py-3 rounded-xl"
            style={{
              background: "#141E2A",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="text-[18px] font-black" style={{ color }}>
              {value}
            </div>
            <div
              className="text-[9px] font-semibold tracking-widest uppercase mt-0.5"
              style={{ color: "#93A4B8" }}
            >
              {label}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Team cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {teams.map((team, i) => (
          <TeamCard key={team.id} team={team} index={i + 1} isAdmin={isAdmin} />
        ))}
      </div>

      {/* Footer */}
      <footer className="text-center py-4">
        <p className="text-[11px]" style={{ color: "#93A4B8" }}>
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noreferrer"
            className="hover:underline"
            style={{ color: "#3B82F6" }}
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
