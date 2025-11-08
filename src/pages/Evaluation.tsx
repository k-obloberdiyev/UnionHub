import { useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { tasks as localTasks } from "@/data/tasks";

const departments = [
  { id: 1, name: "Education", emoji: "📚" },
  { id: 2, name: "Social Events", emoji: "🎉" },
  { id: 3, name: "International Relations", emoji: "🌍" },
  { id: 4, name: "Media", emoji: "📸" },
  { id: 5, name: "Sports", emoji: "⚽" },
  { id: 6, name: "Social Engagement", emoji: "🤝" },
  { id: 7, name: "IT", emoji: "💻" },
];

function computeMetrics(deptId: number) {
  const now = new Date();
  const tasks = localTasks.filter((t) => String(t.department_code) === String(deptId));
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const inProgress = tasks.filter((t) => t.status === "in-progress").length;
  const pending = tasks.filter((t) => t.status === "pending").length;
  const overdueOpen = tasks.filter((t) => new Date(t.deadline) < now && t.status !== "completed").length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  const credibility = Math.max(0, 100 - overdueOpen * 10);
  const dueNext7 = tasks.filter((t) => {
    const d = new Date(t.deadline);
    const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  }).length;
  return { total, completed, inProgress, pending, overdueOpen, progress, credibility, dueNext7 };
}

export default function Evaluation() {
  const rows = useMemo(() => {
    return departments.map((d) => ({
      ...d,
      ...computeMetrics(d.id),
    }));
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Weekly Evaluation</h1>
            <p className="text-muted-foreground">Snapshot of progress, overdue tasks, and credibility per department</p>
          </div>
        </div>

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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
