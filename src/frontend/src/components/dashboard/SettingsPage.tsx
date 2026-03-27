import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Bell, Info, Monitor, Settings } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const CARD_STYLE = {
  background: "#141E2A",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: "12px",
};

interface SettingRow {
  id: string;
  label: string;
  description: string;
  ocid: string;
}

const NOTIFICATION_SETTINGS: SettingRow[] = [
  {
    id: "email",
    label: "Email Alerts",
    description: "Receive critical ops updates via email",
    ocid: "settings.checkbox",
  },
  {
    id: "push",
    label: "Push Notifications",
    description: "Get push alerts on your mobile device",
    ocid: "settings.toggle",
  },
  {
    id: "transport",
    label: "Transport Alerts",
    description: "Driver availability and vehicle status changes",
    ocid: "settings.switch",
  },
  {
    id: "rooms",
    label: "Room Booking Alerts",
    description: "Notifications when room bookings are made or cancelled",
    ocid: "settings.radio",
  },
];

export function SettingsPage() {
  const [notifToggles, setNotifToggles] = useState<Record<string, boolean>>({
    email: true,
    push: true,
    transport: true,
    rooms: false,
  });
  const [darkMode, setDarkMode] = useState(true);
  const [compactView, setCompactView] = useState(false);

  function toggleNotif(id: string) {
    setNotifToggles((p) => ({ ...p, [id]: !p[id] }));
  }

  return (
    <div className="p-5 space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-[18px] font-bold" style={{ color: "#E6EDF5" }}>
          Settings
        </h2>
        <p className="text-[12px]" style={{ color: "#93A4B8" }}>
          App preferences and configuration
        </p>
      </motion.div>

      {/* Notifications */}
      <motion.div
        style={CARD_STYLE}
        className="p-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        data-ocid="settings.panel"
      >
        <div className="flex items-center gap-2 mb-4">
          <Bell size={15} style={{ color: "#3B82F6" }} />
          <h3
            className="text-[14px] font-semibold"
            style={{ color: "#E6EDF5" }}
          >
            Notifications
          </h3>
        </div>
        <div className="space-y-4">
          {NOTIFICATION_SETTINGS.map((setting, i) => (
            <div key={setting.id}>
              {i > 0 && (
                <Separator
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    marginBottom: "16px",
                  }}
                />
              )}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label
                    className="text-[13px] font-medium"
                    style={{ color: "#E6EDF5" }}
                  >
                    {setting.label}
                  </Label>
                  <p
                    className="text-[11px] mt-0.5"
                    style={{ color: "#93A4B8" }}
                  >
                    {setting.description}
                  </p>
                </div>
                <Switch
                  data-ocid={setting.ocid}
                  checked={notifToggles[setting.id] ?? false}
                  onCheckedChange={() => toggleNotif(setting.id)}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Display */}
      <motion.div
        style={CARD_STYLE}
        className="p-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Monitor size={15} style={{ color: "#3B82F6" }} />
          <h3
            className="text-[14px] font-semibold"
            style={{ color: "#E6EDF5" }}
          >
            Display
          </h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label
                className="text-[13px] font-medium"
                style={{ color: "#E6EDF5" }}
              >
                Dark Mode
              </Label>
              <p className="text-[11px] mt-0.5" style={{ color: "#93A4B8" }}>
                Use dark theme across the dashboard
              </p>
            </div>
            <Switch
              data-ocid="settings.toggle"
              checked={darkMode}
              onCheckedChange={setDarkMode}
            />
          </div>
          <Separator style={{ background: "rgba(255,255,255,0.05)" }} />
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label
                className="text-[13px] font-medium"
                style={{ color: "#E6EDF5" }}
              >
                Compact View
              </Label>
              <p className="text-[11px] mt-0.5" style={{ color: "#93A4B8" }}>
                Reduce padding and spacing for denser layout
              </p>
            </div>
            <Switch
              data-ocid="settings.switch"
              checked={compactView}
              onCheckedChange={setCompactView}
            />
          </div>
        </div>
      </motion.div>

      {/* About */}
      <motion.div
        style={CARD_STYLE}
        className="p-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        data-ocid="settings.card"
      >
        <div className="flex items-center gap-2 mb-4">
          <Info size={15} style={{ color: "#3B82F6" }} />
          <h3
            className="text-[14px] font-semibold"
            style={{ color: "#E6EDF5" }}
          >
            About
          </h3>
        </div>
        <div className="space-y-2">
          {[
            { label: "App Name", value: "League Ops Dashboard" },
            { label: "Version", value: "v3.0.0" },
            { label: "Platform", value: "Internet Computer (ICP)" },
            {
              label: "Built For",
              value: "Basketball League — On-ground Staff",
            },
            {
              label: "Last Updated",
              value: new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
            },
          ].map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between py-1"
            >
              <span className="text-[12px]" style={{ color: "#93A4B8" }}>
                {row.label}
              </span>
              <span
                className="text-[12px] font-medium"
                style={{ color: "#E6EDF5" }}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>
        <Separator
          style={{ background: "rgba(255,255,255,0.05)", margin: "12px 0" }}
        />
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
      </motion.div>
    </div>
  );
}
