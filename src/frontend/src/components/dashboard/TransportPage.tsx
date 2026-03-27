import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Car, Loader2, Phone, Truck } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import type { Team } from "../../backend.d";
import {
  useGetTeamTransport,
  useGetTeams,
  useUpdateTransportAvailability,
} from "../../hooks/useQueries";

const CARD_STYLE = {
  background: "#141E2A",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: "12px",
};

function TeamTransportCard({ team, index }: { team: Team; index: number }) {
  const { data: transport, isLoading } = useGetTeamTransport(team.id);
  const updateAvailability = useUpdateTransportAvailability();

  function handleToggle(available: boolean) {
    updateAvailability.mutate(
      { teamId: team.id, available },
      {
        onSuccess: () =>
          toast.success(`Driver availability updated for ${team.name}`),
        onError: () => toast.error("Failed to update availability"),
      },
    );
  }

  return (
    <motion.div
      data-ocid={`transport.item.${index + 1}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      style={CARD_STYLE}
      className="p-4 space-y-3"
    >
      {/* Team header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: "rgba(59,130,246,0.15)",
              border: "1px solid rgba(59,130,246,0.25)",
            }}
          >
            <Truck size={16} style={{ color: "#3B82F6" }} />
          </div>
          <div>
            <div className="text-[13px] font-bold" style={{ color: "#E6EDF5" }}>
              {team.name}
            </div>
            <div className="text-[10px]" style={{ color: "#93A4B8" }}>
              {team.sport}
            </div>
          </div>
        </div>
        {transport && (
          <Badge
            style={{
              background: transport.driverAvailable
                ? "rgba(34,197,94,0.15)"
                : "rgba(239,68,68,0.15)",
              color: transport.driverAvailable ? "#22C55E" : "#EF4444",
              border: `1px solid ${transport.driverAvailable ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
              fontSize: "9px",
              fontWeight: 700,
              letterSpacing: "0.08em",
            }}
          >
            {transport.driverAvailable ? "AVAILABLE" : "UNAVAILABLE"}
          </Badge>
        )}
      </div>

      {/* Transport details */}
      {isLoading ? (
        <div className="flex items-center gap-2" style={{ color: "#93A4B8" }}>
          <Loader2 size={12} className="animate-spin" />
          <span className="text-[11px]">Loading transport...</span>
        </div>
      ) : !transport ? (
        <div
          className="rounded-lg px-3 py-2 text-[11px]"
          style={{
            background: "rgba(255,255,255,0.03)",
            color: "#93A4B8",
            border: "1px dashed rgba(255,255,255,0.08)",
          }}
        >
          No transport assigned
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-0.5">
              <div
                className="text-[9px] uppercase tracking-widest"
                style={{ color: "#93A4B8" }}
              >
                Vehicle Reg
              </div>
              <div className="flex items-center gap-1">
                <Car size={11} style={{ color: "#3B82F6" }} />
                <span
                  className="text-[12px] font-semibold"
                  style={{ color: "#E6EDF5" }}
                >
                  {transport.vehicleRegNumber || "—"}
                </span>
              </div>
            </div>
            <div className="space-y-0.5">
              <div
                className="text-[9px] uppercase tracking-widest"
                style={{ color: "#93A4B8" }}
              >
                Driver
              </div>
              <div
                className="text-[12px] font-semibold"
                style={{ color: "#E6EDF5" }}
              >
                {transport.driverName || "—"}
              </div>
            </div>
            <div className="space-y-0.5 col-span-2">
              <div
                className="text-[9px] uppercase tracking-widest"
                style={{ color: "#93A4B8" }}
              >
                Phone
              </div>
              <div className="flex items-center gap-1">
                <Phone size={11} style={{ color: "#3B82F6" }} />
                <span className="text-[12px]" style={{ color: "#E6EDF5" }}>
                  {transport.driverPhone || "—"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px]" style={{ color: "#93A4B8" }}>
              Driver Available
            </span>
            <Switch
              data-ocid={`transport.switch.${index + 1}`}
              checked={transport.driverAvailable}
              onCheckedChange={handleToggle}
              disabled={updateAvailability.isPending}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}

export function TransportPage() {
  const { data: teams = [], isLoading } = useGetTeams();

  const available = teams.filter((_, i) => i % 3 !== 2).length; // placeholder stat

  return (
    <div className="p-5 space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-[18px] font-bold" style={{ color: "#E6EDF5" }}>
          Transport Overview
        </h2>
        <p className="text-[12px]" style={{ color: "#93A4B8" }}>
          All teams — vehicle & driver status
        </p>
      </motion.div>

      {/* Stats strip */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 gap-3"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {[
          { label: "Total Teams", value: teams.length, color: "#3B82F6" },
          { label: "Drivers Available", value: available, color: "#22C55E" },
          {
            label: "No Transport",
            value: teams.length - available,
            color: "#F59E0B",
          },
        ].map((stat) => (
          <div key={stat.label} style={CARD_STYLE} className="p-3 text-center">
            <div
              className="text-[22px] font-bold"
              style={{ color: stat.color }}
            >
              {stat.value}
            </div>
            <div
              className="text-[10px] uppercase tracking-wide"
              style={{ color: "#93A4B8" }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </motion.div>

      {isLoading ? (
        <div
          className="flex items-center justify-center py-16"
          data-ocid="transport.loading_state"
        >
          <Loader2
            size={24}
            className="animate-spin"
            style={{ color: "#3B82F6" }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {teams.map((team, i) => (
            <TeamTransportCard key={team.id} team={team} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
