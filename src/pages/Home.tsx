import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, TrendingUp, CheckCircle2, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { user } = useAuth();
  const recentActivities = [
    { id: 1, title: "Sports Team Meeting", time: "2 hours ago", type: "event", status: "completed" },
    { id: 2, title: "New Media Post Published", time: "5 hours ago", type: "news", status: "new" },
    { id: 3, title: "IT Department Goal Completed", time: "1 day ago", type: "achievement", status: "completed" },
  ];

  const upcomingEvents = [
    { id: 1, title: "Welcome Week Kickoff", date: "Nov 5, 2025", attendees: 150 },
    { id: 2, title: "International Culture Fair", date: "Nov 12, 2025", attendees: 89 },
    { id: 3, title: "Tech Workshop Series", date: "Nov 15, 2025", attendees: 45 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Members"
            value="30"
            icon={Users}
            trend={{ value: "", positive: true }}
          />
          <StatCard
            title="Upcoming Events"
            value="8"
            icon={Calendar}
            description="This month"
          />
          <StatCard
            title="Active Departments"
            value="7"
            icon={TrendingUp}
            description="All teams engaged"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates from all departments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="mt-1">
                      {activity.status === "completed" ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : (
                        <Clock className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                    <Badge variant={activity.status === "completed" ? "default" : "secondary"}>
                      {activity.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Don't miss these activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="p-3 rounded-lg border space-y-2 hover:border-primary transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{event.date}</p>
                      </div>
                      <Badge variant="outline">{event.attendees} going</Badge>
                    </div>
                    <Button size="sm" className="w-full">
                      Register
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/** Department Progress Overview — visible to authenticated users only */}
        {/** If not logged in, this section is hidden from public pages. */}
        {user ? (
          <Card>
          <CardHeader>
            <CardTitle>Department Progress Overview</CardTitle>
            <CardDescription>Current quarter goals completion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { name: "Education", progress: 75, emoji: "📚" },
                { name: "Social Events", progress: 90, emoji: "🎉" },
                { name: "International Relations", progress: 60, emoji: "🌍" },
                { name: "Media", progress: 85, emoji: "📸" },
                { name: "Sports", progress: 70, emoji: "⚽" },
                { name: "Social Engagement", progress: 80, emoji: "🤝" },
                { name: "IT", progress: 95, emoji: "💻" },
              ].map((dept) => (
                <div key={dept.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{dept.emoji}</span>
                      <span className="font-medium">{dept.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{dept.progress}%</span>
                  </div>
                  <Progress value={dept.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
          </Card>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
