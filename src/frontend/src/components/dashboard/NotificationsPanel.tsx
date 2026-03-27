import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertOctagon, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

const SKELETON_IDS = ["sk-n1", "sk-n2", "sk-n3"];

interface NotifRow {
  id: string;
  type: string;
  message: string;
  severity: "high" | "medium" | "low";
  timestamp: bigint;
  resolved: boolean;
}

const SAMPLE_NOTIFICATIONS: NotifRow[] = [
  {
    id: "n1",
    type: "issue",
    message: "Room block at Grand Hyatt missing 3 reservations",
    severity: "high",
    timestamp: BigInt(Date.now()) * 1_000_000n,
    resolved: false,
  },
  {
    id: "n2",
    type: "openTask",
    message: "Catering order for Lakers not confirmed — deadline in 2h",
    severity: "medium",
    timestamp: BigInt(Date.now() - 3_600_000) * 1_000_000n,
    resolved: false,
  },
  {
    id: "n3",
    type: "overdueReport",
    message: "Daily transport manifest overdue — Route 4B",
    severity: "high",
    timestamp: BigInt(Date.now() - 7_200_000) * 1_000_000n,
    resolved: false,
  },
  {
    id: "n4",
    type: "openTask",
    message: "Housekeeping inspection pending at Marriott floor 7",
    severity: "low",
    timestamp: BigInt(Date.now() - 10_800_000) * 1_000_000n,
    resolved: false,
  },
  {
    id: "n5",
    type: "issue",
    message: "Medical staff check-in delayed — Arena Gate B",
    severity: "high",
    timestamp: BigInt(Date.now() - 14_400_000) * 1_000_000n,
    resolved: false,
  },
];

const severityConfig = {
  high: { color: "#EF4444", icon: AlertOctagon, label: "HIGH" },
  medium: { color: "#F59E0B", icon: AlertTriangle, label: "MED" },
  low: { color: "#22C55E", icon: Info, label: "LOW" },
};

function timeAgo(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  const diff = Date.now() - ms;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

interface NotificationsPanelProps {
  notifications: unknown[];
  loading: boolean;
}

export function NotificationsPanel({
  notifications,
  loading,
}: NotificationsPanelProps) {
  const raw = notifications as NotifRow[];
  const data = raw.length > 0 ? raw : SAMPLE_NOTIFICATIONS;
  const unresolved = data
    .filter((n) => !n.resolved)
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return (
        (order[a.severity as keyof typeof order] ?? 2) -
        (order[b.severity as keyof typeof order] ?? 2)
      );
    });

  return (
    <div
      className="rounded-xl flex flex-col"
      style={{
        background: "#141E2A",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
        minHeight: "200px",
      }}
    >
      <div
        className="px-5 py-4 border-b flex items-center justify-between"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <h2
          className="text-[11px] font-semibold tracking-widest uppercase"
          style={{ color: "#93A4B8" }}
        >
          Live Notifications
        </h2>
        {unresolved.length > 0 && (
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: "rgba(239,68,68,0.2)", color: "#EF4444" }}
          >
            {unresolved.length} pending
          </span>
        )}
      </div>

      <ScrollArea className="flex-1" style={{ maxHeight: "280px" }}>
        {loading ? (
          <div className="p-4 flex flex-col gap-3">
            {SKELETON_IDS.map((id) => (
              <Skeleton
                key={id}
                className="h-14 w-full"
                style={{ background: "rgba(255,255,255,0.07)" }}
              />
            ))}
          </div>
        ) : (
          <div className="p-2">
            <AnimatePresence>
              {unresolved.length === 0 ? (
                <div
                  data-ocid="notifications.empty_state"
                  className="flex flex-col items-center justify-center gap-2 py-8"
                >
                  <CheckCircle2 size={28} style={{ color: "#22C55E" }} />
                  <p className="text-[12px]" style={{ color: "#93A4B8" }}>
                    All clear — no pending notifications
                  </p>
                </div>
              ) : (
                unresolved.map((n, i) => {
                  const cfg =
                    severityConfig[n.severity as keyof typeof severityConfig] ??
                    severityConfig.low;
                  const Icon = cfg.icon;
                  return (
                    <motion.div
                      key={n.id}
                      data-ocid={`notifications.item.${i + 1}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-3 px-3 py-3 rounded-lg mb-1 group"
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        borderLeft: `2px solid ${cfg.color}`,
                      }}
                    >
                      <Icon
                        size={14}
                        style={{
                          color: cfg.color,
                          flexShrink: 0,
                          marginTop: 1,
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-[12px] leading-snug"
                          style={{ color: "#E6EDF5" }}
                        >
                          {n.message}
                        </p>
                        <p
                          className="text-[10px] mt-0.5"
                          style={{ color: "#93A4B8" }}
                        >
                          {timeAgo(n.timestamp)}
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
