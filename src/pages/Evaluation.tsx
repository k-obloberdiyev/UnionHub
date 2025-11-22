import { useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { tasks as localTasks } from "@/data/tasks";
import { departments } from "@/data/departments";
import { computeDepartmentMetrics } from "@/lib/departmentMetrics";

export default function Evaluation() {
  const rows = useMemo(() => {
    return departments.map((d) => ({
      ...d,
      ...computeDepartmentMetrics(localTasks, d.id),
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
