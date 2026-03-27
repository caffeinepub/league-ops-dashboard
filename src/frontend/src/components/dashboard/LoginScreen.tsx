import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dribbble, Loader2, LogIn, Shield, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useGetCallerUserProfile,
  useSaveCallerUserProfile,
} from "../../hooks/useAuth";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";

const ROLE_INFO = [
  { label: "Super Admin", desc: "Full system access", color: "#EF4444" },
  { label: "Admin", desc: "Manage teams & resources", color: "#3B82F6" },
  { label: "Coach", desc: "View team details", color: "#22C55E" },
  { label: "Player", desc: "View roster & schedule", color: "#F59E0B" },
];

export function LoginScreen() {
  const { login, loginStatus, identity } = useInternetIdentity();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const [nameInput, setNameInput] = useState("");
  const [saving, setSaving] = useState(false);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  // Show name setup if logged in but no profile
  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && userProfile === null;

  async function handleSaveName() {
    if (!nameInput.trim()) {
      toast.error("Please enter your name");
      return;
    }
    setSaving(true);
    try {
      await saveProfile({ name: nameInput.trim() });
      toast.success("Profile saved!");
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(160deg, #0B1320 0%, #0F1B2A 100%)",
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: "rgba(59,130,246,0.2)",
              border: "1px solid rgba(59,130,246,0.3)",
            }}
          >
            <Dribbble size={32} style={{ color: "#3B82F6" }} />
          </div>
          <h1
            className="text-[24px] font-black tracking-[0.15em] uppercase"
            style={{ color: "#E6EDF5" }}
          >
            League Ops
          </h1>
          <p
            className="text-[12px] tracking-widest uppercase mt-1"
            style={{ color: "#93A4B8" }}
          >
            Operations Dashboard
          </p>
        </div>

        {/* Main card */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: "#141E2A",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {showProfileSetup ? (
            /* Name setup screen */
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <User size={16} style={{ color: "#3B82F6" }} />
                <h2
                  className="text-[15px] font-bold"
                  style={{ color: "#E6EDF5" }}
                >
                  Set Up Your Profile
                </h2>
              </div>
              <p className="text-[12px]" style={{ color: "#93A4B8" }}>
                You're logged in! Please enter your name to complete setup.
              </p>
              <Input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Your full name"
                className="h-10 text-[13px]"
                style={{
                  background: "#0E1926",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#E6EDF5",
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
              />
              <Button
                onClick={handleSaveName}
                disabled={saving}
                className="w-full h-10 font-bold tracking-wide"
                style={{
                  background: "rgba(59,130,246,0.2)",
                  border: "1px solid rgba(59,130,246,0.4)",
                  color: "#3B82F6",
                }}
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin mr-2" />
                ) : null}
                Save & Continue
              </Button>
            </div>
          ) : (
            /* Login screen */
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <Shield size={16} style={{ color: "#3B82F6" }} />
                <h2
                  className="text-[15px] font-bold"
                  style={{ color: "#E6EDF5" }}
                >
                  Sign In
                </h2>
              </div>

              <p className="text-[12px]" style={{ color: "#93A4B8" }}>
                Sign in with Internet Identity to access the dashboard. Your
                role (Admin, Coach, or Player) will be assigned by a Super
                Admin.
              </p>

              {/* Role badges for info */}
              <div className="grid grid-cols-2 gap-2">
                {ROLE_INFO.map((r) => (
                  <div
                    key={r.label}
                    className="px-3 py-2 rounded-lg"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div
                      className="text-[11px] font-bold"
                      style={{ color: r.color }}
                    >
                      {r.label}
                    </div>
                    <div className="text-[10px]" style={{ color: "#93A4B8" }}>
                      {r.desc}
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => login()}
                disabled={isLoggingIn || profileLoading}
                className="w-full h-11 font-bold tracking-wide text-[13px]"
                style={{
                  background: "rgba(59,130,246,0.2)",
                  border: "1px solid rgba(59,130,246,0.4)",
                  color: "#3B82F6",
                }}
              >
                {isLoggingIn ? (
                  <Loader2 size={14} className="animate-spin mr-2" />
                ) : (
                  <LogIn size={14} className="mr-2" />
                )}
                {isLoggingIn
                  ? "Signing in..."
                  : "Sign In with Internet Identity"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
