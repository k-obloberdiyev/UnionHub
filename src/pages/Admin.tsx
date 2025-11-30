import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Shield, Users, ClipboardList } from "lucide-react";

interface DepartmentItem {
  id: number;
  name: string;
  emoji: string;
  description?: string;
  members?: number;
}

interface AdminProfile {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  name: string | null;
  department_code: number | null;
  class_name: string | null;
  coins: number;
}

interface AdminTask {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'evaluated';
  coins: number;
  deadline: string;
  department_code: number;
  description: string;
  progress?: {
    current: number;
    target: number;
    unit?: string;
  };
  evaluation?: {
    completed: boolean;
    score?: number;
    feedback?: string;
    evaluated_at?: string;
    evaluated_by?: string;
  };
}

export default function Admin() {
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState<string | null>(null);

  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newDeptCode, setNewDeptCode] = useState<string>("");
  const [newClassName, setNewClassName] = useState("");
  const [newBio, setNewBio] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<AdminProfile | null>(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editDeptCode, setEditDeptCode] = useState<string>("");
  const [editClassName, setEditClassName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState("");
  const [editCoins, setEditCoins] = useState<string>("");
  const [editCred, setEditCred] = useState<string>("");
  const [editError, setEditError] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [editTaskOpen, setEditTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<AdminTask | null>(null);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDeptCode, setTaskDeptCode] = useState<string>("");
  const [taskDeadline, setTaskDeadline] = useState("");
  const [taskCoins, setTaskCoins] = useState<string>("");
  const [taskStatus, setTaskStatus] = useState("pending");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskError, setTaskError] = useState<string | null>(null);
  const [taskSaving, setTaskSaving] = useState(false);

  // Progress and evaluation state
  const [progressCurrent, setProgressCurrent] = useState<string>("");
  const [progressTarget, setProgressTarget] = useState<string>("");
  const [progressUnit, setProgressUnit] = useState<string>("");
  const [evaluationScore, setEvaluationScore] = useState<string>("");
  const [evaluationFeedback, setEvaluationFeedback] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const API_URL = (import.meta as any).env.VITE_API_URL as string | undefined;
        if (!API_URL) {
          setError("API_URL is not configured");
          setLoading(false);
          return;
        }

        // Get token from localStorage
        const token = localStorage.getItem('auth_token');
        if (!token) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_URL.replace(/\/$/, "")}/admin/profiles`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error || res.statusText);
        }

        const data = await res.json();
        if (!cancelled) {
          setProfiles(data || []);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load users");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const resetTaskForm = () => {
    setTaskTitle("");
    setTaskDeptCode("");
    setTaskDeadline("");
    setTaskCoins("");
    setTaskStatus("pending");
    setTaskDescription("");
    setProgressCurrent("");
    setProgressTarget("");
    setProgressUnit("");
    setEvaluationScore("");
    setEvaluationFeedback("");
    setTaskError(null);
  };

  const openCreateTask = () => {
    resetTaskForm();
    setSelectedTask(null);
    setCreateTaskOpen(true);
  };

  const openEditTask = (task: AdminTask) => {
    setSelectedTask(task);
    setTaskTitle(task.title);
    setTaskDeptCode(String(task.department_code));
    setTaskDeadline(task.deadline);
    setTaskCoins(String(task.coins));
    setTaskStatus(task.status || "pending");
    setTaskDescription(task.description || "");
    
    if (task.progress) {
      setProgressCurrent(String(task.progress.current));
      setProgressTarget(String(task.progress.target));
      setProgressUnit(task.progress.unit || "");
    } else {
      setProgressCurrent("");
      setProgressTarget("");
      setProgressUnit("");
    }
    
    if (task.evaluation) {
      setEvaluationScore(task.evaluation.score ? String(task.evaluation.score) : "");
      setEvaluationFeedback(task.evaluation.feedback || "");
    } else {
      setEvaluationScore("");
      setEvaluationFeedback("");
    }
    
    setTaskError(null);
    setEditTaskOpen(true);
  };

  const handleSaveTask = async () => {
    setTaskError(null);

    if (!taskTitle || !taskDeptCode || !taskDeadline) {
      setTaskError("Title, department, and deadline are required.");
      return;
    }

    setTaskSaving(true);
    try {
      const API_URL = (import.meta as any).env.VITE_API_URL as string | undefined;
      if (!API_URL) {
        setTaskError("API_URL is not configured");
        return;
      }

      const token = localStorage.getItem('auth_token');
      if (!token) {
        setTaskError("Not authenticated");
        return;
      }

      const payload: any = {
      title: taskTitle,
      department_code: Number(taskDeptCode),
      deadline: taskDeadline,
      coins: taskCoins ? Number(taskCoins) : 0,
      status: taskStatus || "pending",
      description: taskDescription || "",
    };

    // Add progress if available
    if (progressCurrent && progressTarget) {
      payload.progress = {
        current: Number(progressCurrent),
        target: Number(progressTarget),
        unit: progressUnit || undefined
      };
    }

    // Add evaluation if available
    if (evaluationScore || evaluationFeedback) {
      payload.evaluation = {
        completed: true,
        score: evaluationScore ? Number(evaluationScore) : undefined,
        feedback: evaluationFeedback || undefined,
        evaluated_at: new Date().toISOString(),
        evaluated_by: JSON.parse(localStorage.getItem('user') || '{}').email || "admin"
      };
      
      // If we're adding an evaluation, ensure status is set to evaluated
      payload.status = 'evaluated';
    }

      const isEditing = !!selectedTask;
      const url = isEditing
        ? `${API_URL.replace(/\/$/, "")}/admin/tasks/${encodeURIComponent(selectedTask!.id)}`
        : `${API_URL.replace(/\/$/, "")}/admin/tasks`;

      const res = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(body?.error || res.statusText);
      }

      const saved = body as AdminTask;
      if (isEditing) {
        setTasks((prev) => prev.map((t) => (t.id === saved.id ? saved : t)));
        setEditTaskOpen(false);
      } else {
        setTasks((prev) => [...prev, saved]);
        setCreateTaskOpen(false);
      }
    } catch (e: any) {
      setTaskError(e?.message || "Failed to save task");
    } finally {
      setTaskSaving(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
      return;
    }

    try {
      const API_URL = (import.meta as any).env.VITE_API_URL as string | undefined;
      if (!API_URL) {
        throw new Error("API_URL is not configured");
      }

      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error("Not authenticated");
      }

      const res = await fetch(`${API_URL.replace(/\/$/, "")}/admin/tasks/${encodeURIComponent(taskId)}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || res.statusText);
      }

      // Remove the deleted task from the state
      setTasks(prev => prev.filter(task => task.id !== taskId));
      
      // Show success message
      if (typeof window !== 'undefined' && 'alert' in window) {
        alert("Task deleted successfully!");
      }
    } catch (e: any) {
      console.error('Failed to delete task:', e);
      if (typeof window !== 'undefined' && 'alert' in window) {
        alert(`Failed to delete task: ${e?.message || 'Unknown error'}`);
      }
    }
  };

  const handleDeleteEvaluation = async (taskId: string) => {
    if (!window.confirm("Are you sure you want to delete this evaluation? This action cannot be undone.")) {
      return;
    }

    try {
      const API_URL = (import.meta as any).env.VITE_API_URL as string | undefined;
      if (!API_URL) {
        throw new Error("API_URL is not configured");
      }

      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error("Not authenticated");
      }

      const res = await fetch(`${API_URL.replace(/\/$/, "")}/admin/tasks/${encodeURIComponent(taskId)}/evaluation`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || res.statusText);
      }

      // Update the task in state to remove evaluation
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              evaluation: { completed: false, score: null, feedback: '' },
              status: 'completed' // Reset status to completed
            }
          : task
      ));
      
      // Show success message
      if (typeof window !== 'undefined' && 'alert' in window) {
        alert("Evaluation deleted successfully!");
      }
    } catch (e: any) {
      console.error('Failed to delete evaluation:', e);
      if (typeof window !== 'undefined' && 'alert' in window) {
        alert(`Failed to delete evaluation: ${e?.message || 'Unknown error'}`);
      }
    }
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const API_URL = (import.meta as any).env.VITE_API_URL as string | undefined;
        if (!API_URL) {
          setError("API_URL is not configured");
          setLoading(false);
          return;
        }

        const token = localStorage.getItem('auth_token');
        if (!token) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_URL.replace(/\/$/, "")}/admin/profiles`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error || res.statusText);
        }

        const data = await res.json();
        if (!cancelled) {
          setProfiles(data || []);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load users");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadTasks = async () => {
      setTasksLoading(true);
      setTasksError(null);
      try {
        const API_URL = (import.meta as any).env.VITE_API_URL as string | undefined;
        if (!API_URL) {
          setTasksError("API_URL is not configured");
          setTasksLoading(false);
          return;
        }

        // Get token from localStorage
        const token = localStorage.getItem('auth_token');
        if (!token) {
          setTasksError("Not authenticated");
          setTasksLoading(false);
          return;
        }

        const res = await fetch(`${API_URL.replace(/\/$/, "")}/admin/tasks`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error || res.statusText);
        }

        const data = await res.json();
        if (!cancelled) {
          setTasks(data || []);
        }
      } catch (e: any) {
        if (!cancelled) setTasksError(e?.message || "Failed to load tasks");
      } finally {
        if (!cancelled) setTasksLoading(false);
      }
    };

    loadTasks();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch departments from backend
  useEffect(() => {
    let cancelled = false;

    const loadDepartments = async () => {
      setDepartmentsLoading(true);
      try {
        const API_URL = (import.meta as any).env.VITE_API_URL as string | undefined;
        if (!API_URL) {
          console.error("API_URL is not configured");
          setDepartmentsLoading(false);
          return;
        }

        const res = await fetch(`${API_URL.replace(/\/$/, "")}/departments`, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error || res.statusText);
        }

        const data = await res.json();
        if (!cancelled) {
          setDepartments(data || []);
        }
      } catch (e: any) {
        console.error('Failed to load departments:', e?.message);
        // Fallback to static departments if API fails
        if (!cancelled) {
          setDepartments([
            { id: 1, name: "Education", emoji: "📚", description: "Academic workshops and tutoring programs", members: 28 },
            { id: 2, name: "Social Events", emoji: "🎉", description: "Student parties and social gatherings", members: 35 },
            { id: 3, name: "International Relations", emoji: "🌍", description: "Cultural exchange and international student support", members: 22 },
            { id: 4, name: "Media", emoji: "📸", description: "Content creation and social media management", members: 18 },
            { id: 5, name: "Sports", emoji: "⚽", description: "Athletic events and fitness activities", members: 42 },
            { id: 6, name: "Social Engagement", emoji: "🤝", description: "Community service and volunteer programs", members: 31 },
            { id: 7, name: "IT", emoji: "💻", description: "Tech support and digital infrastructure", members: 15 }
          ]);
        }
      } finally {
        if (!cancelled) setDepartmentsLoading(false);
      }
    };

    loadDepartments();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreateUser = async () => {
    setCreateError(null);

    if (!newEmail || !newPassword || !newFullName || !newDeptCode) {
      setCreateError("Email, password, full name, and department are required.");
      return;
    }

    setCreating(true);
    try {
      const API_URL = (import.meta as any).env.VITE_API_URL as string | undefined;
      if (!API_URL) {
        setCreateError("API_URL is not configured");
        return;
      }

      const nameParts = newFullName.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

      const payload: any = {
        name: newFullName,
        first_name: firstName,
        last_name: lastName,
        email: newEmail,
        department_code: Number(newDeptCode),
        class_name: newClassName || null,
        biography: newBio || "",
        password: newPassword,
      };

      const token = localStorage.getItem('auth_token');
      if (!token) {
        setCreateError("Not authenticated");
        return;
      }

      const res = await fetch(`${API_URL.replace(/\/$/, "")}/profiles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || res.statusText);
      }

      const created = await res.json();
      if (created) {
        setProfiles((prev) => [...prev, created]);
      }

      setCreateOpen(false);
    } catch (e: any) {
      setCreateError(e?.message || "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (p: AdminProfile) => {
    setSelected(p);
    setEditError(null);
    setEditFirstName(p.first_name ?? "");
    setEditLastName(p.last_name ?? "");
    setEditDeptCode(p.department_code != null ? String(p.department_code) : "");
    setEditClassName(p.class_name ?? "");
    setEditBio("");
    setEditAvatarUrl("");
    setEditCoins(p.coins != null ? String(p.coins) : "");
    setEditCred("");
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selected) return;
    setEditError(null);
    setSavingEdit(true);
    try {
      const API_URL = (import.meta as any).env.VITE_API_URL as string | undefined;
      if (!API_URL) {
        setEditError("API_URL is not configured");
        return;
      }

      const token = localStorage.getItem('auth_token');
      if (!token) {
        setEditError("Not authenticated");
        return;
      }

      const updates: any = {
        first_name: editFirstName,
        last_name: editLastName,
        department_code: editDeptCode ? Number(editDeptCode) : null,
        class_name: editClassName || null,
        biography: editBio || "",
        avatar_url: editAvatarUrl || null,
      };

      if (editCoins) updates.coins = Number(editCoins);
      if (editCred) updates.credibility_score = Number(editCred);

      const res = await fetch(`${API_URL.replace(/\/$/, "")}/admin/profiles/${encodeURIComponent(selected.id)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(body?.error || res.statusText);
      }

      const updated = body as AdminProfile;
      setProfiles((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
      setEditOpen(false);
    } catch (e: any) {
      setEditError(e?.message || "Failed to update user");
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
            <p className="text-muted-foreground">Manage users and department data</p>
          </div>
          <Badge variant="outline" className="gap-2">
            <Shield className="h-4 w-4" />
            Admin Access
          </Badge>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <CardTitle>Users</CardTitle>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setCreateError(null);
                setNewEmail("");
                setNewPassword("");
                setNewFullName("");
                setNewDeptCode("");
                setNewClassName("");
                setNewBio("");
                setCreateOpen(true);
              }}
            >
              Create User
            </Button>
          </CardHeader>
          <CardContent>
            {loading && <p className="text-sm text-muted-foreground">Loading users…</p>}
            {error && !loading && (
              <p className="text-sm text-destructive">Error loading users: {error}</p>
            )}
            {!loading && !error && (
              <div className="overflow-x-auto">
                {profiles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No users found.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-xs text-muted-foreground">
                        <th className="py-2 text-left font-medium">Name</th>
                        <th className="py-2 text-left font-medium">Email</th>
                        <th className="py-2 text-left font-medium">Department</th>
                        <th className="py-2 text-left font-medium">Class</th>
                        <th className="py-2 text-left font-medium">Coins</th>
                        <th className="py-2 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profiles.map((p) => {
                        const name = p.first_name || p.last_name
                          ? `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim()
                          : p.name || "(no name)";
                        return (
                          <tr key={p.id} className="border-b last:border-0">
                            <td className="py-2 pr-4">{name}</td>
                            <td className="py-2 pr-4">{p.email}</td>
                            <td className="py-2 pr-4">{p.department_code ?? "-"}</td>
                            <td className="py-2 pr-4">{p.class_name ?? "-"}</td>
                            <td className="py-2 pr-4">{p.coins ?? 0}</td>
                            <td className="py-2 pr-4">
                              <Button variant="outline" size="sm" onClick={() => openEdit(p)}>
                                Edit
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              <CardTitle>Tasks</CardTitle>
            </div>
            <Button size="sm" onClick={openCreateTask}>
              Create Task
            </Button>
          </CardHeader>
          <CardContent>
            {tasksLoading && <p className="text-sm text-muted-foreground">Loading tasks…</p>}
            {tasksError && !tasksLoading && (
              <p className="text-sm text-destructive">Error loading tasks: {tasksError}</p>
            )}
            {!tasksLoading && !tasksError && (
              <div className="overflow-x-auto">
                {tasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tasks found.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-xs text-muted-foreground">
                        <th className="py-2 text-left font-medium">Title</th>
                        <th className="py-2 text-left font-medium">Department</th>
                        <th className="py-2 text-left font-medium">Deadline</th>
                        <th className="py-2 text-left font-medium">Progress</th>
                        <th className="py-2 text-left font-medium">Status</th>
                        <th className="py-2 text-left font-medium">Coins</th>
                        <th className="py-2 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((t) => {
                        const progressPercent = t.progress 
                          ? Math.min(100, Math.round((t.progress.current / t.progress.target) * 100))
                          : 0;
                          
                        return (
                          <tr key={t.id} className="border-b last:border-0">
                            <td className="py-2 pr-4">{t.title}</td>
                            <td className="py-2 pr-4">{t.department_code}</td>
                            <td className="py-2 pr-4">{new Date(t.deadline).toLocaleDateString()}</td>
                            <td className="py-2 pr-4">
                              {t.progress ? (
                                <div className="w-24">
                                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full ${
                                        progressPercent >= 100 ? 'bg-green-500' : 'bg-blue-500'
                                      }`}
                                      style={{ width: `${progressPercent}%` }}
                                    ></div>
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {t.progress.current} / {t.progress.target} {t.progress.unit || ''}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">No progress</span>
                              )}
                            </td>
                            <td className="py-2 pr-4">
                              <Badge 
                                variant={
                                  t.status === 'completed' ? 'default' : 
                                  t.status === 'in_progress' ? 'secondary' : 
                                  t.status === 'evaluated' ? 'default' : 'outline'
                                }
                                className="capitalize"
                              >
                                {t.status.replace('_', ' ')}
                              </Badge>
                              {t.evaluation?.completed && (
                                <div className="flex items-center gap-1">
                                  <Badge variant="secondary">
                                    Evaluated
                                  </Badge>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteEvaluation(t.id)}
                                    title="Delete evaluation"
                                  >
                                    ×
                                  </Button>
                                </div>
                              )}
                            </td>
                            <td className="py-2 pr-4">{t.coins}</td>
                            <td className="py-2 pr-4 space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditTask(t)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteTask(t.id)}
                              >
                                Delete
                              </Button>
                              {!t.evaluation?.completed && t.status === 'completed' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedTask(t);
                                    setTaskStatus('evaluated');
                                    setEvaluationScore("100");
                                    setEvaluationFeedback("");
                                    setEditTaskOpen(true);
                                  }}
                                >
                                  Evaluate
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create User</DialogTitle>
              <DialogDescription>Add a new member profile.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="new-full-name">Full name</Label>
                <Input
                  id="new-full-name"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="Jane Doe"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="new-email">Email</Label>
                <Input
                  id="new-email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="jane@example.com"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="new-password">Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="new-dept">Department</Label>
                <select
                  id="new-dept"
                  value={newDeptCode}
                  onChange={(e) => setNewDeptCode(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.emoji} {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="new-class">Class</Label>
                <Input
                  id="new-class"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="10-01"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="new-bio">Biography</Label>
                <Textarea
                  id="new-bio"
                  value={newBio}
                  onChange={(e) => setNewBio(e.target.value)}
                  placeholder="Short bio..."
                />
              </div>
              {createError && (
                <p className="text-sm text-destructive">{createError}</p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleCreateUser} disabled={creating}>
                {creating ? "Creating..." : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Update profile details.</DialogDescription>
            </DialogHeader>
            {selected && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="edit-first-name">First name</Label>
                  <Input
                    id="edit-first-name"
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-last-name">Last name</Label>
                  <Input
                    id="edit-last-name"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-dept">Department</Label>
                  <select
                    id="edit-dept"
                    value={editDeptCode}
                    onChange={(e) => setEditDeptCode(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">No Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.emoji} {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-class">Class</Label>
                  <Input
                    id="edit-class"
                    value={editClassName}
                    onChange={(e) => setEditClassName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-avatar">Avatar URL</Label>
                  <Input
                    id="edit-avatar"
                    value={editAvatarUrl}
                    onChange={(e) => setEditAvatarUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-bio">Biography (append)</Label>
                  <Textarea
                    id="edit-bio"
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Additional biography details..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="edit-coins">Coins</Label>
                    <Input
                      id="edit-coins"
                      type="number"
                      value={editCoins}
                      onChange={(e) => setEditCoins(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="edit-cred">Credibility</Label>
                    <Input
                      id="edit-cred"
                      type="number"
                      value={editCred}
                      onChange={(e) => setEditCred(e.target.value)}
                    />
                  </div>
                </div>
                {editError && (
                  <p className="text-sm text-destructive">{editError}</p>
                )}
              </div>
            )}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSaveEdit} disabled={savingEdit || !selected}>
                {savingEdit ? "Saving..." : "Save"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={createTaskOpen} onOpenChange={setCreateTaskOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Task</DialogTitle>
              <DialogDescription>Add a new task for a department.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="task-title">Title</Label>
                <Input
                  id="task-title"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Task title"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="task-dept">Department</Label>
                <select
                  id="task-dept"
                  value={taskDeptCode}
                  onChange={(e) => setTaskDeptCode(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.emoji} {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="task-deadline">Deadline</Label>
                <Input
                  id="task-deadline"
                  type="date"
                  value={taskDeadline}
                  onChange={(e) => setTaskDeadline(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="task-coins">Coins</Label>
                <Input
                  id="task-coins"
                  type="number"
                  value={taskCoins}
                  onChange={(e) => setTaskCoins(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="task-status">Status</Label>
                <Input
                  id="task-status"
                  value={taskStatus}
                  onChange={(e) => setTaskStatus(e.target.value)}
                  placeholder="pending/in_progress/completed"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="task-description">Description</Label>
                <Textarea
                  id="task-description"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Task description..."
                />
              </div>
              <div className="space-y-3 pt-2 border-t">
                <h4 className="font-medium">Progress Tracking</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="task-progress-current">Current</Label>
                    <Input
                      id="task-progress-current"
                      type="number"
                      min="0"
                      value={progressCurrent}
                      onChange={(e) => setProgressCurrent(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="task-progress-target">Target</Label>
                    <Input
                      id="task-progress-target"
                      type="number"
                      min="1"
                      value={progressTarget}
                      onChange={(e) => setProgressTarget(e.target.value)}
                      placeholder="100"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="task-progress-unit">Unit</Label>
                    <Input
                      id="task-progress-unit"
                      value={progressUnit}
                      onChange={(e) => setProgressUnit(e.target.value)}
                      placeholder="e.g., points, hours"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-3 pt-2 border-t">
                <h4 className="font-medium">Evaluation</h4>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="task-evaluation-score">Score (0-100)</Label>
                    <Input
                      id="task-evaluation-score"
                      type="number"
                      min="0"
                      max="100"
                      value={evaluationScore}
                      onChange={(e) => setEvaluationScore(e.target.value)}
                      placeholder="0-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="task-evaluation-feedback">Feedback</Label>
                    <Textarea
                      id="task-evaluation-feedback"
                      value={evaluationFeedback}
                      onChange={(e) => setEvaluationFeedback(e.target.value)}
                      placeholder="Evaluation feedback..."
                    />
                  </div>
                </div>
              </div>
              {taskError && (
                <p className="text-sm text-destructive">{taskError}</p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="ghost" onClick={() => setCreateTaskOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSaveTask} disabled={taskSaving}>
                {taskSaving ? "Saving..." : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={editTaskOpen} onOpenChange={setEditTaskOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
              <DialogDescription>Update task details.</DialogDescription>
            </DialogHeader>
            {selectedTask && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="edit-task-title">Title</Label>
                  <Input
                    id="edit-task-title"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-task-dept">Department</Label>
                  <select
                    id="edit-task-dept"
                    value={taskDeptCode}
                    onChange={(e) => setTaskDeptCode(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.emoji} {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-task-deadline">Deadline</Label>
                  <Input
                    id="edit-task-deadline"
                    type="date"
                    value={taskDeadline}
                    onChange={(e) => setTaskDeadline(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-task-coins">Coins</Label>
                  <Input
                    id="edit-task-coins"
                    type="number"
                    value={taskCoins}
                    onChange={(e) => setTaskCoins(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-task-status">Status</Label>
                  <Input
                    id="edit-task-status"
                    value={taskStatus}
                    onChange={(e) => setTaskStatus(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-task-description">Description</Label>
                  <Textarea
                    id="edit-task-description"
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-3 pt-2 border-t">
                  <h4 className="font-medium">Progress Tracking</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="edit-task-progress-current">Current</Label>
                      <Input
                        id="edit-task-progress-current"
                        type="number"
                        min="0"
                        value={progressCurrent}
                        onChange={(e) => setProgressCurrent(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="edit-task-progress-target">Target</Label>
                      <Input
                        id="edit-task-progress-target"
                        type="number"
                        min="1"
                        value={progressTarget}
                        onChange={(e) => setProgressTarget(e.target.value)}
                        placeholder="100"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="edit-task-progress-unit">Unit</Label>
                      <Input
                        id="edit-task-progress-unit"
                        value={progressUnit}
                        onChange={(e) => setProgressUnit(e.target.value)}
                        placeholder="e.g., points, hours"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-3 pt-2 border-t">
                  <h4 className="font-medium">Evaluation</h4>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="edit-task-evaluation-score">Score (0-100)</Label>
                      <Input
                        id="edit-task-evaluation-score"
                        type="number"
                        min="0"
                        max="100"
                        value={evaluationScore}
                        onChange={(e) => setEvaluationScore(e.target.value)}
                        placeholder="0-100"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="edit-task-evaluation-feedback">Feedback</Label>
                      <Textarea
                        id="edit-task-evaluation-feedback"
                        value={evaluationFeedback}
                        onChange={(e) => setEvaluationFeedback(e.target.value)}
                        placeholder="Evaluation feedback..."
                      />
                    </div>
                  </div>
                </div>
                {taskError && (
                  <p className="text-sm text-destructive">{taskError}</p>
                )}
              </div>
            )}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="ghost" onClick={() => setEditTaskOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSaveTask} disabled={taskSaving || !selectedTask}>
                {taskSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
