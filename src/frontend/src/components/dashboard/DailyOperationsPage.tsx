import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, ClipboardList, Loader2, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Task } from "../../backend.d";
import { useAddTask, useCancelTask, useGetTasks } from "../../hooks/useQueries";

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

function formatDueDate(ts: bigint) {
  const d = new Date(Number(ts));
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DailyOperationsPage() {
  const { data: fetchedTasks = [] } = useGetTasks();
  const addTask = useAddTask();
  const cancelTask = useCancelTask();

  // Local state to append newly created tasks
  const [localTasks, setLocalTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    id: "",
    description: "",
    assignedTo: "",
    dueDate: "",
  });

  const allTasks = [...fetchedTasks, ...localTasks];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.description || !form.assignedTo || !form.dueDate) {
      toast.error("All fields required");
      return;
    }
    const id = `task-${Date.now()}`;
    const task: Task = {
      id,
      description: form.description,
      assignedTo: form.assignedTo,
      dueDate: BigInt(new Date(form.dueDate).getTime()),
    };
    addTask.mutate(task, {
      onSuccess: () => {
        setLocalTasks((p) => [...p, task]);
        toast.success("Task added");
        setForm({ id: "", description: "", assignedTo: "", dueDate: "" });
        setShowForm(false);
      },
      onError: () => {
        // Still add locally if backend fails
        setLocalTasks((p) => [...p, task]);
        toast.success("Task added locally");
        setForm({ id: "", description: "", assignedTo: "", dueDate: "" });
        setShowForm(false);
      },
    });
  }

  function handleCancel(taskId: string) {
    cancelTask.mutate(taskId, {
      onSuccess: () => {
        setLocalTasks((p) => p.filter((t) => t.id !== taskId));
        toast.success("Task cancelled");
      },
      onError: () => {
        setLocalTasks((p) => p.filter((t) => t.id !== taskId));
        toast.success("Task removed");
      },
    });
  }

  return (
    <div className="p-5 space-y-5">
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <h2 className="text-[18px] font-bold" style={{ color: "#E6EDF5" }}>
            Daily Operations
          </h2>
          <p className="text-[12px]" style={{ color: "#93A4B8" }}>
            {allTasks.length} active task{allTasks.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          data-ocid="ops.open_modal_button"
          size="sm"
          onClick={() => setShowForm((v) => !v)}
          style={{ background: "#3B82F6", color: "#fff", border: "none" }}
        >
          <Plus size={14} className="mr-1" />
          Add Task
        </Button>
      </motion.div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={CARD_STYLE}
          className="p-5"
          data-ocid="ops.dialog"
        >
          <h3
            className="text-[14px] font-semibold mb-4"
            style={{ color: "#E6EDF5" }}
          >
            New Task
          </h3>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <div className="space-y-1 sm:col-span-2">
              <Label style={{ color: "#93A4B8", fontSize: "11px" }}>
                Description
              </Label>
              <Input
                data-ocid="ops.input"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Task description"
                style={INPUT_STYLE}
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#93A4B8", fontSize: "11px" }}>
                Assigned To
              </Label>
              <Input
                value={form.assignedTo}
                onChange={(e) =>
                  setForm((p) => ({ ...p, assignedTo: e.target.value }))
                }
                placeholder="Person or team"
                style={INPUT_STYLE}
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#93A4B8", fontSize: "11px" }}>
                Due Date
              </Label>
              <Input
                type="datetime-local"
                value={form.dueDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, dueDate: e.target.value }))
                }
                style={INPUT_STYLE}
              />
            </div>
            <div className="sm:col-span-2 flex gap-3 justify-end">
              <Button
                type="button"
                data-ocid="ops.cancel_button"
                variant="ghost"
                size="sm"
                style={{ color: "#93A4B8" }}
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                data-ocid="ops.submit_button"
                size="sm"
                disabled={addTask.isPending}
                style={{ background: "#3B82F6", color: "#fff", border: "none" }}
              >
                {addTask.isPending ? (
                  <Loader2 size={14} className="animate-spin mr-1" />
                ) : null}
                Add Task
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="space-y-3">
        {allTasks.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 gap-3"
            data-ocid="ops.empty_state"
          >
            <ClipboardList size={36} style={{ color: "#93A4B8" }} />
            <p style={{ color: "#93A4B8" }}>No tasks yet</p>
          </div>
        ) : (
          allTasks.map((task, i) => (
            <motion.div
              key={task.id}
              data-ocid={`ops.item.${i + 1}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              style={CARD_STYLE}
              className="p-4 flex items-start gap-4"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{
                  background: "rgba(59,130,246,0.12)",
                  border: "1px solid rgba(59,130,246,0.2)",
                }}
              >
                <ClipboardList size={15} style={{ color: "#3B82F6" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="text-[13px] font-semibold"
                  style={{ color: "#E6EDF5" }}
                >
                  {task.description}
                </div>
                <div
                  className="text-[11px] mt-0.5"
                  style={{ color: "#93A4B8" }}
                >
                  Assigned to: {task.assignedTo}
                </div>
                <div
                  className="flex items-center gap-1 mt-1"
                  style={{ color: "#93A4B8" }}
                >
                  <Calendar size={10} />
                  <span className="text-[10px]">
                    {formatDueDate(task.dueDate)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                data-ocid={`ops.delete_button.${i + 1}`}
                onClick={() => handleCancel(task.id)}
                className="flex-shrink-0 p-2 rounded-lg transition-colors hover:bg-red-500/10"
                style={{ color: "#EF4444" }}
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
