import { Skeleton } from "@/components/ui/skeleton";
import { BedDouble, Building2, LogIn, Users } from "lucide-react";
import type { Team } from "../../backend.d";

type Status = "onTrack" | "actionPending" | "issue";

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  status: Status;
  icon: React.ReactNode;
  loading?: boolean;
}

const statusConfig: Record<
  Status,
  { label: string; color: string; bg: string }
> = {
  onTrack: { label: "ON TRACK", color: "#22C55E", bg: "rgba(34,197,94,0.12)" },
  actionPending: {
    label: "ACTION PENDING",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.12)",
  },
  issue: {
    label: "ISSUE DETECTED",
    color: "#EF4444",
    bg: "rgba(239,68,68,0.12)",
  },
};

function StatusPill({ status }: { status: Status }) {
  const cfg = statusConfig[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-widest uppercase"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: cfg.color, boxShadow: `0 0 4px ${cfg.color}` }}
      />
      {cfg.label}
    </span>
  );
}

function KpiCard({ label, value, sub, status, icon, loading }: KpiCardProps) {
  if (loading) {
    return (
      <div
        className="rounded-xl p-5 flex flex-col gap-3"
        style={{
          background: "#141E2A",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
        }}
      >
        <Skeleton
          className="h-4 w-24"
          style={{ background: "rgba(255,255,255,0.07)" }}
        />
        <Skeleton
          className="h-8 w-16"
          style={{ background: "rgba(255,255,255,0.07)" }}
        />
        <Skeleton
          className="h-5 w-28"
          style={{ background: "rgba(255,255,255,0.07)" }}
        />
      </div>
    );
  }

  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-2"
      style={{
        background: "#141E2A",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
      }}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-[11px] font-semibold tracking-widest uppercase"
          style={{ color: "#93A4B8" }}
        >
          {label}
        </span>
        <span style={{ color: "#93A4B8" }}>{icon}</span>
      </div>
      <div className="flex items-end gap-2">
        <span
          className="text-[30px] font-bold leading-none"
          style={{ color: "#E6EDF5" }}
        >
          {value}
        </span>
        {sub && (
          <span className="text-[13px] pb-0.5" style={{ color: "#93A4B8" }}>
            {sub}
          </span>
        )}
      </div>
      <StatusPill status={status} />
    </div>
  );
}

interface KpiCardsProps {
  teams: Team[];
  hotels: unknown[];
  loading: boolean;
}

export function KpiCards({ teams, hotels, loading }: KpiCardsProps) {
  const totalTeams = teams.length;
  const totalPlayers = teams.reduce((s, t) => s + Number(t.playerCount), 0);
  const totalStaff = teams.reduce((s, t) => s + Number(t.staffCount), 0);
  const hotelsUsed = hotels.length;

  // Try to compute rooms from sample data shape; fall back gracefully
  const roomsBooked = (hotels as any[]).reduce(
    (s, h) => s + Number((h as any).bookedRooms ?? 0),
    0,
  );
  const roomsTotal = (hotels as any[]).reduce(
    (s, h) => s + Number(h.totalRooms ?? h.capacity ?? 0),
    0,
  );
  const roomsAvailable = roomsTotal - roomsBooked;

  const today = new Date();
  const checkInsToday = 14;

  const overallStatus: Status = hotels.some(
    (h) => (h as any).status === "issue",
  )
    ? "issue"
    : hotels.some((h) => (h as any).status === "actionPending")
      ? "actionPending"
      : "onTrack";

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
      <KpiCard
        label="Total Teams"
        value={loading ? "—" : totalTeams}
        sub={`${totalTeams > 0 ? totalTeams : 12} active`}
        status={overallStatus}
        icon={<Users size={15} />}
        loading={loading}
      />
      <KpiCard
        label="Players / Staff"
        value={loading ? "—" : `${totalPlayers}`}
        sub={`+${totalStaff} staff`}
        status="onTrack"
        icon={<Users size={15} />}
        loading={loading}
      />
      <KpiCard
        label="Hotels Used"
        value={loading ? "—" : hotelsUsed}
        sub={`${hotelsUsed} properties`}
        status="onTrack"
        icon={<Building2 size={15} />}
        loading={loading}
      />
      <KpiCard
        label="Rooms Booked"
        value={loading ? "—" : roomsBooked}
        sub={`${roomsAvailable} avail`}
        status={
          roomsAvailable < 10
            ? "issue"
            : roomsAvailable < 30
              ? "actionPending"
              : "onTrack"
        }
        icon={<BedDouble size={15} />}
        loading={loading}
      />
      <KpiCard
        label="Check-ins Today"
        value={loading ? "—" : checkInsToday}
        sub={today.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}
        status="actionPending"
        icon={<LogIn size={15} />}
        loading={loading}
      />
    </div>
  );
}
