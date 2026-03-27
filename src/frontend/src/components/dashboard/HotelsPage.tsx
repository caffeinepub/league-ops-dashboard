import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Building2, Loader2, MapPin, Plus, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Hotel } from "../../backend.d";
import { useAddHotel, useGetHotels } from "../../hooks/useQueries";

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

export function HotelsPage() {
  const { data: hotels = [], isLoading } = useGetHotels();
  const addHotel = useAddHotel();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    id: "",
    name: "",
    address: "",
    capacity: "",
    available: true,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.id || !form.name || !form.address || !form.capacity) {
      toast.error("All fields are required");
      return;
    }
    const hotel: Hotel = {
      id: form.id,
      name: form.name,
      address: form.address,
      capacity: BigInt(form.capacity),
      available: form.available,
    };
    addHotel.mutate(hotel, {
      onSuccess: () => {
        toast.success("Hotel added successfully");
        setForm({
          id: "",
          name: "",
          address: "",
          capacity: "",
          available: true,
        });
        setShowForm(false);
      },
      onError: () => toast.error("Failed to add hotel"),
    });
  }

  return (
    <div className="p-5 space-y-5">
      {/* Header row */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <h2 className="text-[18px] font-bold" style={{ color: "#E6EDF5" }}>
            Hotels
          </h2>
          <p className="text-[12px]" style={{ color: "#93A4B8" }}>
            {hotels.length} registered hotel{hotels.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          data-ocid="hotels.open_modal_button"
          size="sm"
          onClick={() => setShowForm((v) => !v)}
          style={{ background: "#3B82F6", color: "#fff", border: "none" }}
        >
          <Plus size={14} className="mr-1" />
          Add Hotel
        </Button>
      </motion.div>

      {/* Add Hotel Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          style={CARD_STYLE}
          className="p-5"
          data-ocid="hotels.dialog"
        >
          <h3
            className="text-[14px] font-semibold mb-4"
            style={{ color: "#E6EDF5" }}
          >
            New Hotel
          </h3>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <div className="space-y-1">
              <Label style={{ color: "#93A4B8", fontSize: "11px" }}>
                Hotel ID
              </Label>
              <Input
                data-ocid="hotels.input"
                value={form.id}
                onChange={(e) => setForm((p) => ({ ...p, id: e.target.value }))}
                placeholder="e.g. HTL-001"
                style={INPUT_STYLE}
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#93A4B8", fontSize: "11px" }}>Name</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Hotel name"
                style={INPUT_STYLE}
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label style={{ color: "#93A4B8", fontSize: "11px" }}>
                Address
              </Label>
              <Input
                value={form.address}
                onChange={(e) =>
                  setForm((p) => ({ ...p, address: e.target.value }))
                }
                placeholder="Full address"
                style={INPUT_STYLE}
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#93A4B8", fontSize: "11px" }}>
                Capacity (rooms)
              </Label>
              <Input
                type="number"
                min={1}
                value={form.capacity}
                onChange={(e) =>
                  setForm((p) => ({ ...p, capacity: e.target.value }))
                }
                placeholder="e.g. 120"
                style={INPUT_STYLE}
              />
            </div>
            <div className="space-y-1 flex items-end gap-3">
              <Label style={{ color: "#93A4B8", fontSize: "11px" }}>
                Available
              </Label>
              <Switch
                data-ocid="hotels.switch"
                checked={form.available}
                onCheckedChange={(v) =>
                  setForm((p) => ({ ...p, available: v }))
                }
              />
            </div>
            <div className="sm:col-span-2 flex gap-3 justify-end pt-2">
              <Button
                type="button"
                data-ocid="hotels.cancel_button"
                variant="ghost"
                size="sm"
                style={{ color: "#93A4B8" }}
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                data-ocid="hotels.submit_button"
                size="sm"
                disabled={addHotel.isPending}
                style={{ background: "#3B82F6", color: "#fff", border: "none" }}
              >
                {addHotel.isPending ? (
                  <Loader2 size={14} className="animate-spin mr-1" />
                ) : null}
                Save Hotel
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Hotels Grid */}
      {isLoading ? (
        <div
          className="flex items-center justify-center py-16"
          data-ocid="hotels.loading_state"
        >
          <Loader2
            size={24}
            className="animate-spin"
            style={{ color: "#3B82F6" }}
          />
        </div>
      ) : hotels.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 gap-3"
          data-ocid="hotels.empty_state"
        >
          <Building2 size={36} style={{ color: "#93A4B8" }} />
          <p style={{ color: "#93A4B8" }}>No hotels registered yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {hotels.map((hotel, i) => (
            <motion.div
              key={hotel.id}
              data-ocid={`hotels.item.${i + 1}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              style={CARD_STYLE}
              className="p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "rgba(59,130,246,0.15)",
                      border: "1px solid rgba(59,130,246,0.25)",
                    }}
                  >
                    <Building2 size={16} style={{ color: "#3B82F6" }} />
                  </div>
                  <div>
                    <div
                      className="text-[13px] font-semibold"
                      style={{ color: "#E6EDF5" }}
                    >
                      {hotel.name}
                    </div>
                    <div className="text-[10px]" style={{ color: "#93A4B8" }}>
                      {hotel.id}
                    </div>
                  </div>
                </div>
                <Badge
                  style={{
                    background: hotel.available
                      ? "rgba(34,197,94,0.15)"
                      : "rgba(239,68,68,0.15)",
                    color: hotel.available ? "#22C55E" : "#EF4444",
                    border: `1px solid ${hotel.available ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                    fontSize: "9px",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                  }}
                >
                  {hotel.available ? "AVAILABLE" : "FULL"}
                </Badge>
              </div>
              <div
                className="flex items-center gap-2"
                style={{ color: "#93A4B8" }}
              >
                <MapPin size={12} />
                <span className="text-[12px] truncate">{hotel.address}</span>
              </div>
              <div
                className="flex items-center gap-2"
                style={{ color: "#93A4B8" }}
              >
                <Users size={12} />
                <span className="text-[12px]">
                  {hotel.capacity.toString()} rooms capacity
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
