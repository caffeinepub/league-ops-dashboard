import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { BedDouble, Loader2, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Room } from "../../backend.d";
import {
  useAddRoom,
  useBookRoom,
  useCancelBooking,
  useGetAvailableRooms,
} from "../../hooks/useQueries";

const CARD_STYLE = {
  background: "#141E2A",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: "12px",
};

const INPUT_STYLE = {
  background: "#0E1926",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#E6EDF5",
};

export function RoomBlocksPage() {
  const { data: rooms = [], isLoading } = useGetAvailableRooms();
  const addRoom = useAddRoom();
  const bookRoom = useBookRoom();
  const cancelBooking = useCancelBooking();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ number: "", beds: "", isAvailable: true });
  const [bookingTeamId, setBookingTeamId] = useState<Record<string, string>>(
    {},
  );

  function handleAddRoom(e: React.FormEvent) {
    e.preventDefault();
    if (!form.number || !form.beds) {
      toast.error("Room number and beds required");
      return;
    }
    const room: Room = {
      number: BigInt(form.number),
      beds: BigInt(form.beds),
      isAvailable: form.isAvailable,
    };
    addRoom.mutate(room, {
      onSuccess: () => {
        toast.success("Room added");
        setForm({ number: "", beds: "", isAvailable: true });
        setShowForm(false);
      },
      onError: () => toast.error("Failed to add room"),
    });
  }

  function handleBook(room: Room) {
    const key = room.number.toString();
    const teamId = bookingTeamId[key];
    if (!teamId) {
      toast.error("Enter a Team ID to book");
      return;
    }
    bookRoom.mutate(
      { teamId, roomId: room.number },
      {
        onSuccess: () =>
          toast.success(`Room ${room.number} booked for ${teamId}`),
        onError: () => toast.error("Booking failed"),
      },
    );
  }

  function handleCancel(room: Room) {
    const key = room.number.toString();
    const teamId = bookingTeamId[key];
    if (!teamId) {
      toast.error("Enter the Team ID to cancel");
      return;
    }
    cancelBooking.mutate(
      { roomId: room.number, teamId },
      {
        onSuccess: () => toast.success("Booking cancelled"),
        onError: () => toast.error("Cancel failed"),
      },
    );
  }

  return (
    <div className="p-5 space-y-5">
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <h2 className="text-[18px] font-bold" style={{ color: "#E6EDF5" }}>
            Room Blocks
          </h2>
          <p className="text-[12px]" style={{ color: "#93A4B8" }}>
            {rooms.length} available room{rooms.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          data-ocid="rooms.open_modal_button"
          size="sm"
          onClick={() => setShowForm((v) => !v)}
          style={{ background: "#3B82F6", color: "#fff", border: "none" }}
        >
          <Plus size={14} className="mr-1" />
          Add Room
        </Button>
      </motion.div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={CARD_STYLE}
          className="p-5"
          data-ocid="rooms.dialog"
        >
          <h3
            className="text-[14px] font-semibold mb-4"
            style={{ color: "#E6EDF5" }}
          >
            New Room
          </h3>
          <form
            onSubmit={handleAddRoom}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <div className="space-y-1">
              <Label style={{ color: "#93A4B8", fontSize: "11px" }}>
                Room Number
              </Label>
              <Input
                data-ocid="rooms.input"
                type="number"
                min={1}
                value={form.number}
                onChange={(e) =>
                  setForm((p) => ({ ...p, number: e.target.value }))
                }
                placeholder="e.g. 101"
                style={INPUT_STYLE}
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#93A4B8", fontSize: "11px" }}>Beds</Label>
              <Input
                type="number"
                min={1}
                value={form.beds}
                onChange={(e) =>
                  setForm((p) => ({ ...p, beds: e.target.value }))
                }
                placeholder="e.g. 2"
                style={INPUT_STYLE}
              />
            </div>
            <div className="space-y-1 flex items-end gap-3">
              <Label style={{ color: "#93A4B8", fontSize: "11px" }}>
                Available
              </Label>
              <Switch
                data-ocid="rooms.switch"
                checked={form.isAvailable}
                onCheckedChange={(v) =>
                  setForm((p) => ({ ...p, isAvailable: v }))
                }
              />
            </div>
            <div className="sm:col-span-3 flex gap-3 justify-end pt-1">
              <Button
                type="button"
                data-ocid="rooms.cancel_button"
                variant="ghost"
                size="sm"
                style={{ color: "#93A4B8" }}
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                data-ocid="rooms.submit_button"
                size="sm"
                disabled={addRoom.isPending}
                style={{ background: "#3B82F6", color: "#fff", border: "none" }}
              >
                {addRoom.isPending ? (
                  <Loader2 size={14} className="animate-spin mr-1" />
                ) : null}
                Save
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {isLoading ? (
        <div
          className="flex items-center justify-center py-16"
          data-ocid="rooms.loading_state"
        >
          <Loader2
            size={24}
            className="animate-spin"
            style={{ color: "#3B82F6" }}
          />
        </div>
      ) : rooms.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 gap-3"
          data-ocid="rooms.empty_state"
        >
          <BedDouble size={36} style={{ color: "#93A4B8" }} />
          <p style={{ color: "#93A4B8" }}>No available rooms found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {rooms.map((room, i) => {
            const key = room.number.toString();
            return (
              <motion.div
                key={key}
                data-ocid={`rooms.item.${i + 1}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                style={CARD_STYLE}
                className="p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{
                        background: "rgba(59,130,246,0.15)",
                        border: "1px solid rgba(59,130,246,0.25)",
                      }}
                    >
                      <BedDouble size={16} style={{ color: "#3B82F6" }} />
                    </div>
                    <div>
                      <div
                        className="text-[14px] font-bold"
                        style={{ color: "#E6EDF5" }}
                      >
                        Room {room.number.toString()}
                      </div>
                      <div className="text-[11px]" style={{ color: "#93A4B8" }}>
                        {room.beds.toString()} bed{room.beds > 1n ? "s" : ""}
                      </div>
                    </div>
                  </div>
                  <Badge
                    style={{
                      background: room.isAvailable
                        ? "rgba(34,197,94,0.15)"
                        : "rgba(239,68,68,0.15)",
                      color: room.isAvailable ? "#22C55E" : "#EF4444",
                      border: `1px solid ${room.isAvailable ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                      fontSize: "9px",
                      fontWeight: 700,
                    }}
                  >
                    {room.isAvailable ? "AVAILABLE" : "BOOKED"}
                  </Badge>
                </div>
                <div className="pt-1 space-y-2">
                  <Input
                    data-ocid={`rooms.input.${i + 1}`}
                    value={bookingTeamId[key] ?? ""}
                    onChange={(e) =>
                      setBookingTeamId((p) => ({ ...p, [key]: e.target.value }))
                    }
                    placeholder="Team ID (e.g. team-001)"
                    style={{ ...INPUT_STYLE, fontSize: "12px" }}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      data-ocid={`rooms.primary_button.${i + 1}`}
                      className="flex-1"
                      style={{
                        background: "#3B82F6",
                        color: "#fff",
                        border: "none",
                        fontSize: "11px",
                      }}
                      onClick={() => handleBook(room)}
                      disabled={bookRoom.isPending}
                    >
                      Book
                    </Button>
                    <Button
                      size="sm"
                      data-ocid={`rooms.delete_button.${i + 1}`}
                      variant="ghost"
                      className="flex-1"
                      style={{
                        color: "#EF4444",
                        fontSize: "11px",
                        border: "1px solid rgba(239,68,68,0.3)",
                      }}
                      onClick={() => handleCancel(room)}
                      disabled={cancelBooking.isPending}
                    >
                      Cancel Booking
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
