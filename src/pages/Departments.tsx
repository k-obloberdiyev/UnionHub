import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { members as localMembers } from "@/data/members";
import { tasks as localTasks } from "@/data/tasks";
import { CheckCircle2, Circle, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { departments } from "@/data/departments";
import { computeDepartmentProgress } from "@/lib/departmentMetrics";

export default function Departments() {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState<any[]>(localMembers);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Using local static members data; no async fetch needed
    setUsersList(localMembers);
    setLoadingUsers(false);
  }, []);

  const getMembersForDept = (deptId: number) => {
    return usersList.filter((u) => String(u.department_code) === String(deptId));
  };
  const getTasksForDept = (deptId: number) => {
    return localTasks.filter((t) => String(t.department_code) === String(deptId));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
            <p className="text-muted-foreground">Manage team goals and track progress</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {departments.map((dept) => (
            <Card
              key={dept.id}
              className={`hover:shadow-lg transition-shadow ${!user ? "cursor-pointer" : ""}`}
              onClick={() => { if (!user) navigate(`/departments/${dept.id}/members`); }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{dept.emoji}</div>
                    <div>
                      <CardTitle>{dept.name}</CardTitle>
                      <CardDescription>{dept.description}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline">{dept.members} members</Badge>
                </div>
                {/* Read-only: add-member UI removed by request */}
              </CardHeader>
              <CardContent className="space-y-4">
                {user && (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium flex items-center gap-3">
                          {computeDepartmentProgress(localTasks, dept.id)}%
                          <Link to="/evaluation" className="text-primary hover:underline">View evaluation</Link>
                        </span>
                      </div>
                      <Progress value={computeDepartmentProgress(localTasks, dept.id)} className="h-2" />
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold">Tasks</h4>
                      {getTasksForDept(dept.id).map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            {task.status === "completed" ? (
                              <CheckCircle2 className="h-5 w-5 text-success" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground" />
                            )}
                            <div className="flex-1">
                              <div className={`text-sm ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                                {task.title}
                              </div>
                              <div className="text-xs text-muted-foreground">Deadline: {new Date(task.deadline).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-coin-gold font-semibold">+{task.coins}</span>
                            <Badge variant={task.status === 'completed' ? 'default' : task.status === 'in-progress' ? 'secondary' : 'outline'} className="text-xs">
                              {task.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Members</h4>
                  {loadingUsers ? (
                    <p className="text-sm text-muted-foreground">Loading members…</p>
                  ) : (
                    (() => {
                      const members = getMembersForDept(dept.id);
                      if (!members.length) return <p className="text-sm text-muted-foreground">No members listed</p>;
                      return (
                        <ul className="space-y-2">
                          {members.slice(0, 6).map((m) => (
                            <li key={m.id} className="flex items-center gap-3">
                              <img src={m.avatar || '/placeholder.svg'} alt="avatar" className="h-8 w-8 rounded-full object-cover" />
                              <span className="text-sm">{m.name}</span>
                            </li>
                          ))}
                        </ul>
                      );
                    })()
                  )}
                </div>
                <div className="pt-2">
                  <Link to={`/departments/${dept.id}/members`} className="text-sm text-primary hover:underline">View all members</Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
