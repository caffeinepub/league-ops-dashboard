import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SKELETON_ROWS = ["sk-0", "sk-1", "sk-2", "sk-3"];
const SKELETON_COLS = ["c0", "c1", "c2", "c3", "c4", "c5"];

interface HotelRow {
  id: string;
  name: string;
  location: string;
  totalRooms: bigint;
  bookedRooms: bigint;
  status: "onTrack" | "actionPending" | "issue";
}

interface HotelTableProps {
  hotels: unknown[];
  loading: boolean;
  onManage?: (hotelId: string) => void;
}

const statusDot: Record<string, { color: string; label: string }> = {
  onTrack: { color: "#22C55E", label: "On Track" },
  actionPending: { color: "#F59E0B", label: "Action Pending" },
  issue: { color: "#EF4444", label: "Issue" },
};

const SAMPLE_HOTELS: HotelRow[] = [
  {
    id: "h1",
    name: "Grand Hyatt Arena District",
    location: "Chicago, IL",
    totalRooms: 120n,
    bookedRooms: 98n,
    status: "onTrack",
  },
  {
    id: "h2",
    name: "Marriott Courtyard Downtown",
    location: "Los Angeles, CA",
    totalRooms: 85n,
    bookedRooms: 72n,
    status: "actionPending",
  },
  {
    id: "h3",
    name: "Hilton Garden Inn Midtown",
    location: "New York, NY",
    totalRooms: 200n,
    bookedRooms: 165n,
    status: "onTrack",
  },
  {
    id: "h4",
    name: "Westin Convention Center",
    location: "Houston, TX",
    totalRooms: 140n,
    bookedRooms: 130n,
    status: "issue",
  },
  {
    id: "h5",
    name: "Embassy Suites Sports Complex",
    location: "Dallas, TX",
    totalRooms: 95n,
    bookedRooms: 61n,
    status: "onTrack",
  },
];

export function HotelTable({ hotels, loading, onManage }: HotelTableProps) {
  const data: HotelRow[] =
    hotels.length > 0 ? (hotels as HotelRow[]) : SAMPLE_HOTELS;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "#141E2A",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
      }}
    >
      <div
        className="px-5 py-4 border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <h2
          className="text-[11px] font-semibold tracking-widest uppercase"
          style={{ color: "#93A4B8" }}
        >
          Hotel Overview
        </h2>
      </div>
      <Table>
        <TableHeader>
          <TableRow style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            {[
              "Hotel Name",
              "Location",
              "Occupancy",
              "Available",
              "Status",
              "Action",
            ].map((h) => (
              <TableHead
                key={h}
                className="text-[11px] font-semibold tracking-wider uppercase"
                style={{ color: "#93A4B8", background: "#101A25" }}
              >
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading
            ? SKELETON_ROWS.map((rowId, i) => (
                <TableRow
                  key={rowId}
                  style={{
                    borderColor: "rgba(255,255,255,0.06)",
                    background: i % 2 === 0 ? "#101A25" : "#141E2A",
                  }}
                >
                  {SKELETON_COLS.map((colId) => (
                    <TableCell key={colId}>
                      <Skeleton
                        className="h-4 w-24"
                        style={{ background: "rgba(255,255,255,0.07)" }}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : data.map((hotel, i) => {
                const occupancy = Math.round(
                  (Number(hotel.bookedRooms) / Number(hotel.totalRooms)) * 100,
                );
                const available =
                  Number(hotel.totalRooms) - Number(hotel.bookedRooms);
                const dot = statusDot[hotel.status] ?? statusDot.onTrack;
                return (
                  <TableRow
                    key={hotel.id}
                    data-ocid={`hotel.item.${i + 1}`}
                    className="transition-colors hover:bg-white/[0.03] cursor-default"
                    style={{
                      borderColor: "rgba(255,255,255,0.06)",
                      background: i % 2 === 0 ? "#101A25" : "#141E2A",
                    }}
                  >
                    <TableCell
                      className="font-medium text-[13px]"
                      style={{ color: "#E6EDF5" }}
                    >
                      {hotel.name}
                    </TableCell>
                    <TableCell
                      className="text-[12px]"
                      style={{ color: "#93A4B8" }}
                    >
                      {hotel.location}
                    </TableCell>
                    <TableCell
                      className="text-[12px]"
                      style={{ color: "#E6EDF5" }}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-1.5 rounded-full flex-1 max-w-[60px]"
                          style={{ background: "rgba(255,255,255,0.1)" }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${occupancy}%`,
                              background: "#3B82F6",
                            }}
                          />
                        </div>
                        <span>{occupancy}%</span>
                      </div>
                    </TableCell>
                    <TableCell
                      className="text-[12px]"
                      style={{ color: "#93A4B8" }}
                    >
                      {available} rooms
                    </TableCell>
                    <TableCell>
                      <span
                        className="flex items-center gap-1.5 text-[12px]"
                        style={{ color: "#93A4B8" }}
                      >
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{
                            background: dot.color,
                            boxShadow: `0 0 4px ${dot.color}`,
                          }}
                        />
                        {dot.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        data-ocid={`hotel.edit_button.${i + 1}`}
                        className="text-[12px] font-medium hover:underline transition-opacity hover:opacity-80"
                        style={{ color: "#3B82F6" }}
                        onClick={() => onManage?.(hotel.id)}
                      >
                        Manage
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
        </TableBody>
      </Table>
    </div>
  );
}
