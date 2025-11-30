import { useMemo, useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { departments } from "@/data/departments";
import { computeDepartmentMetrics } from "@/lib/departmentMetrics";

interface AdminTask {
  id: string;
  title: string;
  status: string;
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

export default function Evaluation() {
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadTasks = async () => {
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
        if (!cancelled) setError(e?.message || "Failed to load tasks");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadTasks();
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo(() => {
    return departments.map((d) => ({
      ...d,
      ...computeDepartmentMetrics(tasks, d.id),
    }));
  }, [tasks]);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Weekly Evaluation</h1>
            <p className="text-muted-foreground">Snapshot of progress, overdue tasks, and credibility per department</p>
          </div>
        </div>

        {loading && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading evaluation data...</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-8">
            <p className="text-destructive">Error loading evaluation data: {error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid gap-6 md:grid-cols-2">
            {rows.map((r) => (
              <Card key={r.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{r.emoji}</div>
                      <div>
                        <CardTitle>{r.name}</CardTitle>
                        <div className="text-sm text-muted-foreground">{r.completed}/{r.total} completed • {r.overdueOpen} overdue • {r.dueNext7} due next 7d</div>
                      </div>
                    </div>
                    <Badge variant="secondary">Credibility {r.credibility}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Progress {r.progress}%</Badge>
                    <Badge variant="outline">In-progress {r.inProgress}</Badge>
                    <Badge variant="outline">Pending {r.pending}</Badge>
                    {r.avgEvaluationScore > 0 && (
                      <Badge variant="secondary">Avg Score {r.avgEvaluationScore}</Badge>
                    )}
                  </div>
                  {r.total > 0 && (
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Task Completion</span>
                        <span className="font-medium">{r.completed}/{r.total}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            r.progress >= 80 ? 'bg-green-500' : 
                            r.progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${r.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
