import {
  BarChart3,
  BedDouble,
  Building2,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import {
  useGetAvailableRooms,
  useGetHotels,
  useGetTeams,
} from "../../hooks/useQueries";

const CARD_STYLE = {
  background: "#141E2A",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: "12px",
};

const STAT_COLORS = ["#3B82F6", "#22C55E", "#F59E0B", "#A78BFA", "#F472B6"];

export function ReportsPage() {
  const { data: teams = [] } = useGetTeams();
  const { data: hotels = [] } = useGetHotels();
  const { data: rooms = [] } = useGetAvailableRooms();

  const totalPlayers = teams.reduce((acc, t) => acc + Number(t.playerCount), 0);
  const totalStaff = teams.reduce((acc, t) => acc + Number(t.staffCount), 0);
  const availableHotels = hotels.filter((h) => h.available).length;

  const stats = [
    {
      label: "Total Teams",
      value: teams.length,
      icon: Users,
      color: STAT_COLORS[0],
    },
    {
      label: "Total Players",
      value: totalPlayers,
      icon: UserCheck,
      color: STAT_COLORS[1],
    },
    {
      label: "Hotels Registered",
      value: hotels.length,
      icon: Building2,
      color: STAT_COLORS[2],
    },
    {
      label: "Available Rooms",
      value: rooms.length,
      icon: BedDouble,
      color: STAT_COLORS[3],
    },
    {
      label: "Support Staff",
      value: totalStaff,
      icon: TrendingUp,
      color: STAT_COLORS[4],
    },
  ];

  const summary = [
    `${teams.length} teams are registered for this season's league operations.`,
    `${totalPlayers} players total across all teams, with ${totalStaff} support staff members.`,
    `${hotels.length} hotels registered; ${availableHotels} currently available for bookings.`,
    `${rooms.length} rooms currently available for team allocation.`,
    teams.length > 0
      ? `Average squad size is ${Math.round(totalPlayers / teams.length)} players per team.`
      : "No teams yet — add teams to see averages.",
  ];

  return (
    <div className="p-5 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-[18px] font-bold" style={{ color: "#E6EDF5" }}>
          Reports
        </h2>
        <p className="text-[12px]" style={{ color: "#93A4B8" }}>
          Season summary & league-wide statistics
        </p>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
      >
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              data-ocid={`reports.card.${i + 1}`}
              style={CARD_STYLE}
              className="p-4 space-y-2"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{
                  background: `${stat.color}20`,
                  border: `1px solid ${stat.color}40`,
                }}
              >
                <Icon size={16} style={{ color: stat.color }} />
              </div>
              <div
                className="text-[26px] font-bold leading-none"
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
          );
        })}
      </motion.div>

      {/* Quick Summary */}
      <motion.div
        style={CARD_STYLE}
        className="p-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
        data-ocid="reports.panel"
      >
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={16} style={{ color: "#3B82F6" }} />
          <h3
            className="text-[14px] font-semibold"
            style={{ color: "#E6EDF5" }}
          >
            Quick Summary
          </h3>
        </div>
        <ul className="space-y-2">
          {summary.map((line, i) => (
            <li key={line} className="flex items-start gap-2">
              <span
                className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: STAT_COLORS[i % STAT_COLORS.length] }}
              />
              <span className="text-[13px]" style={{ color: "#93A4B8" }}>
                {line}
              </span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Team breakdown table */}
      <motion.div
        style={CARD_STYLE}
        className="p-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.3 }}
        data-ocid="reports.table"
      >
        <h3
          className="text-[14px] font-semibold mb-4"
          style={{ color: "#E6EDF5" }}
        >
          Team Breakdown
        </h3>
        {teams.length === 0 ? (
          <p className="text-[12px]" style={{ color: "#93A4B8" }}>
            No teams registered
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table
              className="w-full text-[12px]"
              style={{ borderCollapse: "separate", borderSpacing: "0 4px" }}
            >
              <thead>
                <tr>
                  {["Team", "Sport", "Players", "Staff"].map((h) => (
                    <th
                      key={h}
                      className="text-left pb-2 pr-4"
                      style={{
                        color: "#93A4B8",
                        fontWeight: 600,
                        fontSize: "10px",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {teams.map((team, i) => (
                  <tr key={team.id} data-ocid={`reports.row.${i + 1}`}>
                    <td
                      className="py-2 pr-4 font-semibold"
                      style={{ color: "#E6EDF5" }}
                    >
                      {team.name}
                    </td>
                    <td className="py-2 pr-4" style={{ color: "#93A4B8" }}>
                      {team.sport}
                    </td>
                    <td
                      className="py-2 pr-4"
                      style={{ color: "#3B82F6", fontWeight: 700 }}
                    >
                      {team.playerCount.toString()}
                    </td>
                    <td className="py-2" style={{ color: "#93A4B8" }}>
                      {team.staffCount.toString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
