import { Skeleton } from "@/components/ui/skeleton";

const CATEGORIES = [
  "Team Check-in",
  "Catering",
  "Transport",
  "Housekeeping",
  "Guest Services",
];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const SKELETON_IDS = ["sk-h1", "sk-h2", "sk-h3", "sk-h4", "sk-h5"];

const SAMPLE_GRID: Record<string, boolean[]> = {
  "Team Check-in": [true, true, false, true, true, false, false],
  Catering: [true, false, true, true, false, true, false],
  Transport: [false, true, true, false, true, true, false],
  Housekeeping: [true, true, false, false, true, false, true],
  "Guest Services": [false, false, true, true, false, true, true],
};

interface TaskLike {
  id: string;
  description: string;
  assignedTo: string;
  dueDate: bigint;
  category?: string;
}

interface TaskHeatmapProps {
  tasks: TaskLike[];
  loading: boolean;
}

export function TaskHeatmap({ tasks, loading }: TaskHeatmapProps) {
  const grid: Record<string, boolean[]> = {};
  if (tasks.length > 0) {
    for (const cat of CATEGORIES) {
      grid[cat] = DAYS.map((_, dayIdx) => {
        return tasks.some((t) => {
          const d = new Date(Number(t.dueDate) / 1_000_000);
          return t.category === cat && d.getDay() === (dayIdx + 1) % 7;
        });
      });
    }
  }

  const heatData = tasks.length > 0 ? grid : SAMPLE_GRID;

  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: "#141E2A",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
      }}
    >
      <h2
        className="text-[11px] font-semibold tracking-widest uppercase mb-4"
        style={{ color: "#93A4B8" }}
      >
        Task Tracker
      </h2>

      {loading ? (
        <div className="flex flex-col gap-2">
          {SKELETON_IDS.map((id) => (
            <Skeleton
              key={id}
              className="h-7 w-full"
              style={{ background: "rgba(255,255,255,0.07)" }}
            />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table
            className="w-full"
            style={{ borderCollapse: "separate", borderSpacing: "3px" }}
          >
            <thead>
              <tr>
                <th
                  className="text-left text-[10px] font-semibold tracking-wider uppercase pr-2 pb-1"
                  style={{ color: "#93A4B8", minWidth: "100px" }}
                >
                  Category
                </th>
                {DAYS.map((d) => (
                  <th
                    key={d}
                    className="text-center text-[10px] font-semibold tracking-wider uppercase pb-1"
                    style={{ color: "#93A4B8", minWidth: "32px" }}
                  >
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CATEGORIES.map((cat) => (
                <tr key={cat}>
                  <td
                    className="text-[11px] pr-3 py-0.5"
                    style={{ color: "#93A4B8", whiteSpace: "nowrap" }}
                  >
                    {cat}
                  </td>
                  {DAYS.map((day) => {
                    const di = DAYS.indexOf(day);
                    const active = heatData[cat]?.[di] ?? false;
                    return (
                      <td key={day} className="text-center py-0.5">
                        <div
                          className="w-7 h-7 rounded mx-auto"
                          style={{
                            background: active
                              ? "#F59E0B"
                              : "rgba(255,255,255,0.05)",
                            boxShadow: active
                              ? "0 0 6px rgba(245,158,11,0.4)"
                              : "none",
                          }}
                          title={`${cat} \u2013 ${day}: ${active ? "Active" : "Inactive"}`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center gap-4 mt-3">
        <span
          className="flex items-center gap-1.5 text-[10px]"
          style={{ color: "#93A4B8" }}
        >
          <span className="w-3 h-3 rounded" style={{ background: "#F59E0B" }} />
          Active
        </span>
        <span
          className="flex items-center gap-1.5 text-[10px]"
          style={{ color: "#93A4B8" }}
        >
          <span
            className="w-3 h-3 rounded"
            style={{ background: "rgba(255,255,255,0.05)" }}
          />
          No Task
        </span>
      </div>
    </div>
  );
}
