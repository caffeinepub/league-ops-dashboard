import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Toaster } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  BedDouble,
  Bell,
  Building2,
  ChevronDown,
  ClipboardList,
  Dribbble,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Truck,
  Users,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { DailyOperationsPage } from "./components/dashboard/DailyOperationsPage";
import { HotelTable } from "./components/dashboard/HotelTable";
import { HotelsPage } from "./components/dashboard/HotelsPage";
import { KpiCards } from "./components/dashboard/KpiCards";
import { LoginScreen } from "./components/dashboard/LoginScreen";
import { NotificationsPanel } from "./components/dashboard/NotificationsPanel";
import { ReportsPage } from "./components/dashboard/ReportsPage";
import { RoomBlocksPage } from "./components/dashboard/RoomBlocksPage";
import { SettingsPage } from "./components/dashboard/SettingsPage";
import { TaskHeatmap } from "./components/dashboard/TaskHeatmap";
import { TeamManagement } from "./components/dashboard/TeamManagement";
import { TransportPage } from "./components/dashboard/TransportPage";
import { useGetCallerRole, useGetCallerUserProfile } from "./hooks/useAuth";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  useGetHotels,
  useGetNotifications,
  useGetTasks,
  useGetTeams,
} from "./hooks/useQueries";

type Page =
  | "Dashboard"
  | "Team Allocations"
  | "Hotels"
  | "Room Blocks"
  | "Daily Operations"
  | "Transport"
  | "Reports"
  | "Settings";

const NAV_ITEMS: {
  icon: typeof LayoutDashboard;
  label: string;
  page: Page;
}[] = [
  { icon: LayoutDashboard, label: "Dashboard", page: "Dashboard" },
  { icon: Building2, label: "Hotels", page: "Hotels" },
  { icon: Users, label: "Team Allocations", page: "Team Allocations" },
  { icon: BedDouble, label: "Room Blocks", page: "Room Blocks" },
  { icon: ClipboardList, label: "Daily Operations", page: "Daily Operations" },
  { icon: Truck, label: "Transport", page: "Transport" },
  { icon: BarChart3, label: "Reports", page: "Reports" },
  { icon: Settings, label: "Settings", page: "Settings" },
];

const STATUS_CONFIG = {
  onTrack: { label: "ON TRACK", color: "#22C55E", glow: "rgba(34,197,94,0.3)" },
  actionPending: {
    label: "ACTION PENDING",
    color: "#F59E0B",
    glow: "rgba(245,158,11,0.3)",
  },
  issue: {
    label: "ISSUE DETECTED",
    color: "#EF4444",
    glow: "rgba(239,68,68,0.3)",
  },
};

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  admin: { label: "Admin", color: "#3B82F6" },
  coach: { label: "Coach", color: "#22C55E" },
  player: { label: "Player", color: "#F59E0B" },
  guest: { label: "Guest", color: "#93A4B8" },
};

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>("Dashboard");
  const queryClient = useQueryClient();

  const { identity, clear } = useInternetIdentity();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();
  const { data: userRole = "guest" } = useGetCallerRole();

  const isAuthenticated = !!identity;
  // Show login if not authenticated, or if authenticated but profile hasn't loaded yet
  const showLogin =
    !isAuthenticated ||
    (isAuthenticated && profileFetched && userProfile === null);
  const isLoading = isAuthenticated && profileLoading;

  const { data: hotels = [], isLoading: hotelsLoading } = useGetHotels();
  const { data: tasks = [], isLoading: tasksLoading } = useGetTasks();
  const { data: notifications = [], isLoading: notifsLoading } =
    useGetNotifications();
  const { data: teams = [], isLoading: teamsLoading } = useGetTeams();

  const loading = hotelsLoading || teamsLoading;

  const overallStatus: keyof typeof STATUS_CONFIG = hotels.some(
    (h) => (h as any).status === "issue",
  )
    ? "issue"
    : hotels.some((h) => (h as any).status === "actionPending")
      ? "actionPending"
      : "onTrack";

  const statusCfg = STATUS_CONFIG[overallStatus];

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const unresolved =
    (notifications as any[]).filter((n) => !n.resolved).length || 0;

  async function handleLogout() {
    await clear();
    queryClient.clear();
  }

  function handleNavClick(page: Page) {
    setCurrentPage(page);
    setSidebarOpen(false);
  }

  function renderPage() {
    switch (currentPage) {
      case "Team Allocations":
        return <TeamManagement teams={teams} userRole={userRole} />;
      case "Hotels":
        return <HotelsPage />;
      case "Room Blocks":
        return <RoomBlocksPage />;
      case "Daily Operations":
        return <DailyOperationsPage />;
      case "Transport":
        return <TransportPage />;
      case "Reports":
        return <ReportsPage />;
      case "Settings":
        return <SettingsPage />;
      default:
        return (
          <div className="p-5 space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <KpiCards teams={teams} hotels={hotels} loading={loading} />
            </motion.div>

            <motion.div
              className="flex flex-col xl:flex-row gap-5"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="xl:flex-[65] min-w-0">
                <HotelTable
                  hotels={hotels}
                  loading={hotelsLoading}
                  onManage={(_id) => setCurrentPage("Hotels")}
                />
              </div>
              <div className="xl:flex-[35] flex flex-col gap-5">
                <TaskHeatmap tasks={tasks} loading={tasksLoading} />
                <NotificationsPanel
                  notifications={notifications as any[]}
                  loading={notifsLoading}
                />
              </div>
            </motion.div>

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
  }

  // Show login screen if not authenticated or no profile
  if (showLogin || isLoading) {
    return (
      <>
        <LoginScreen />
        <Toaster />
      </>
    );
  }

  const roleCfg = ROLE_LABELS[userRole] || ROLE_LABELS.guest;
  const displayName = userProfile?.name || "User";
  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #0B1320 0%, #0F1B2A 100%)",
      }}
    >
      {/* Mobile overlay */}
      {sidebarOpen && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: overlay dismiss
        <div
          role="presentation"
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative z-30 flex flex-col h-full transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          width: "240px",
          background: "#0E1926",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-5 py-5 border-b"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: "rgba(59,130,246,0.2)",
              border: "1px solid rgba(59,130,246,0.3)",
            }}
          >
            <Dribbble size={18} style={{ color: "#3B82F6" }} />
          </div>
          <div>
            <div
              className="text-[13px] font-bold tracking-widest uppercase"
              style={{ color: "#E6EDF5" }}
            >
              League Ops
            </div>
            <div
              className="text-[9px] tracking-widest uppercase"
              style={{ color: "#93A4B8" }}
            >
              Operations Center
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div
            className="text-[9px] font-semibold tracking-widest uppercase px-2 mb-2"
            style={{ color: "#93A4B8" }}
          >
            Main Menu
          </div>
          {NAV_ITEMS.map((item) => {
            const { icon: Icon, label, page } = item;
            const active = page === currentPage;
            return (
              <button
                type="button"
                key={label}
                data-ocid={`nav.${label.toLowerCase().replace(/\s+/g, "_")}.link`}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-[13px] font-medium transition-all"
                style={{
                  color: active ? "#E6EDF5" : "#93A4B8",
                  background: active ? "rgba(59,130,246,0.15)" : "transparent",
                  borderLeft: active
                    ? "2px solid #3B82F6"
                    : "2px solid transparent",
                }}
                onClick={() => handleNavClick(page)}
              >
                <Icon
                  size={15}
                  style={{ color: active ? "#3B82F6" : "#93A4B8" }}
                />
                {label}
              </button>
            );
          })}
        </nav>

        {/* User block */}
        <div
          className="px-4 py-4 border-t"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarFallback
                style={{
                  background: "rgba(59,130,246,0.2)",
                  color: "#3B82F6",
                  fontSize: "11px",
                  fontWeight: 700,
                }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div
                className="text-[12px] font-semibold truncate"
                style={{ color: "#E6EDF5" }}
              >
                {displayName}
              </div>
              <div
                className="text-[10px] font-bold"
                style={{ color: roleCfg.color }}
              >
                {roleCfg.label}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] transition-colors hover:bg-white/5"
            style={{ color: "#93A4B8" }}
          >
            <LogOut size={13} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header
          className="flex items-center gap-4 px-5 py-4 border-b flex-shrink-0"
          style={{
            borderColor: "rgba(255,255,255,0.06)",
            background: "rgba(14,25,38,0.8)",
          }}
        >
          <button
            type="button"
            data-ocid="nav.menu.toggle"
            className="lg:hidden p-1.5 rounded"
            style={{ color: "#93A4B8" }}
            onClick={() => setSidebarOpen((v) => !v)}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div className="flex-1">
            <h1
              className="text-[16px] font-bold tracking-[0.15em] uppercase"
              style={{ color: "#E6EDF5" }}
            >
              {currentPage}
            </h1>
            <p
              className="text-[11px] tracking-wide"
              style={{ color: "#93A4B8" }}
            >
              {today}
            </p>
          </div>

          {/* Overall status */}
          <div
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              background: `rgba(${
                overallStatus === "onTrack"
                  ? "34,197,94"
                  : overallStatus === "actionPending"
                    ? "245,158,11"
                    : "239,68,68"
              },0.1)`,
              border: `1px solid ${statusCfg.color}33`,
            }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{
                background: statusCfg.color,
                boxShadow: `0 0 6px ${statusCfg.glow}`,
              }}
            />
            <span
              className="text-[10px] font-bold tracking-widest uppercase"
              style={{ color: statusCfg.color }}
            >
              {statusCfg.label}
            </span>
          </div>

          {/* Bell */}
          <button
            type="button"
            data-ocid="header.bell.button"
            className="relative p-2 rounded-lg transition-colors hover:bg-white/5"
            style={{ color: "#93A4B8" }}
          >
            <Bell size={18} />
            {unresolved > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                style={{ background: "#EF4444", color: "#fff" }}
              >
                {unresolved > 9 ? "9+" : unresolved}
              </span>
            )}
          </button>

          {/* Avatar */}
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarFallback
              style={{
                background: "rgba(59,130,246,0.2)",
                color: "#3B82F6",
                fontSize: "11px",
                fontWeight: 700,
              }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
        </header>

        {/* Scrollable page body */}
        <main className="flex-1 overflow-y-auto">{renderPage()}</main>
      </div>

      <Toaster />
    </div>
  );
}
