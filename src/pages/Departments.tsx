import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/client";
import { members as localMembers } from "@/data/members";
import { tasks as localTasks } from "@/data/tasks";
import { CheckCircle2, Circle, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
 
const departments = [
  {
    id: 1,
    name: "Education",
    emoji: "📚",
    description: "Academic workshops and tutoring programs",
    tasks: [
      { id: 1, title: "Organize Study Groups", status: "completed", coins: 50, deadline: "2025-11-10" },
      { id: 2, title: "Host Exam Prep Workshops", status: "in-progress", coins: 75, deadline: "2025-11-18" },
      { id: 3, title: "Create Resource Library", status: "pending", coins: 100, deadline: "2025-12-01" },
    ],
    progress: 45,
    members: 28,
  },
  {
    id: 2,
    name: "Social Events",
    emoji: "🎉",
    description: "Student parties and social gatherings",
    tasks: [
      { id: 1, title: "Welcome Week Party", status: "completed", coins: 100, deadline: "2025-09-01" },
      { id: 2, title: "Semester End Celebration", status: "in-progress", coins: 150, deadline: "2025-12-20" },
      { id: 3, title: "Monthly Social Mixers", status: "completed", coins: 50, deadline: "2025-11-01" },
    ],
    progress: 75,
    members: 35,
  },
  {
    id: 3,
    name: "International Relations",
    emoji: "🌍",
    description: "Cultural exchange and international student support",
    tasks: [
      { id: 1, title: "Culture Fair Planning", status: "in-progress", coins: 120, deadline: "2025-11-12" },
      { id: 2, title: "Language Exchange Program", status: "pending", coins: 80, deadline: "2026-01-15" },
      { id: 3, title: "International Student Buddy System", status: "completed", coins: 60, deadline: "2025-10-01" },
    ],
    progress: 55,
    members: 22,
  },
  {
    id: 4,
    name: "Media",
    emoji: "📸",
    description: "Content creation and social media management",
    tasks: [
      { id: 1, title: "Weekly Content Calendar", status: "completed", coins: 40, deadline: "2025-11-01" },
      { id: 2, title: "Video Documentary Project", status: "in-progress", coins: 200, deadline: "2026-02-01" },
      { id: 3, title: "Photography Workshop", status: "completed", coins: 70, deadline: "2025-11-08" },
    ],
    progress: 80,
    members: 18,
  },
  {
    id: 5,
    name: "Sports",
    emoji: "⚽",
    description: "Athletic events and fitness activities",
    tasks: [
      { id: 1, title: "Intramural Tournament", status: "completed", coins: 150, deadline: "2025-10-20" },
      { id: 2, title: "Fitness Challenge Campaign", status: "in-progress", coins: 90, deadline: "2025-12-01" },
      { id: 3, title: "Sports Equipment Inventory", status: "pending", coins: 50, deadline: "2026-01-05" },
    ],
    progress: 60,
    members: 42,
  },
  {
    id: 6,
    name: "Social Engagement",
    emoji: "🤝",
    description: "Community service and volunteer programs",
    tasks: [
      { id: 1, title: "Local Charity Drive", status: "completed", coins: 100, deadline: "2025-11-30" },
      { id: 2, title: "Environmental Cleanup Day", status: "in-progress", coins: 80, deadline: "2025-12-15" },
      { id: 3, title: "Senior Center Visit Program", status: "completed", coins: 70, deadline: "2025-10-05" },
    ],
    progress: 70,
    members: 31,
  },
  {
    id: 7,
    name: "IT",
    emoji: "💻",
    description: "Tech support and digital infrastructure",
    tasks: [
      { id: 1, title: "Website Maintenance", status: "completed", coins: 120, deadline: "2025-10-15" },
      { id: 2, title: "Mobile App Development", status: "in-progress", coins: 300, deadline: "2026-03-01" },
      { id: 3, title: "Tech Workshop Series", status: "completed", coins: 100, deadline: "2025-09-20" },
    ],
    progress: 85,
    members: 15,
  },
];

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
                        <span className="font-medium">{dept.progress}%</span>
                      </div>
                      <Progress value={dept.progress} className="h-2" />
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
