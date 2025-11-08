import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, TrendingUp, Award } from "lucide-react";

export default function Admin() {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
            <p className="text-muted-foreground">Manage users, approvals, and system settings</p>
          </div>
          <Badge variant="outline" className="gap-2">
            <Shield className="h-4 w-4" />
            Admin Access
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">342</div>
              <p className="text-xs text-muted-foreground">+12 this week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">8</div>
              <p className="text-xs text-muted-foreground">Requires action</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Coins Distributed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-coin-gold">12.5K</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Ongoing</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent User Activity</CardTitle>
              <CardDescription>Latest registrations and actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Alice Brown", action: "Registered", time: "5 min ago" },
                  { name: "Bob Smith", action: "Completed Profile", time: "12 min ago" },
                  { name: "Carol White", action: "Earned 50 coins", time: "1 hour ago" },
                  { name: "David Lee", action: "Joined Event", time: "2 hours ago" },
                ].map((activity, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">{activity.name}</p>
                      <p className="text-sm text-muted-foreground">{activity.action}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Goal Approvals</CardTitle>
              <CardDescription>Department goals awaiting review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { dept: "Education", goal: "Study Group Initiative", coins: 50 },
                  { dept: "Sports", goal: "Intramural Setup", coins: 100 },
                  { dept: "Media", goal: "Video Series Launch", coins: 150 },
                ].map((item, i) => (
                  <div key={i} className="p-3 rounded-lg border space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.goal}</p>
                        <p className="text-sm text-muted-foreground">{item.dept}</p>
                      </div>
                      <Badge variant="outline" className="text-coin-gold">
                        +{item.coins} coins
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1" variant="default">
                        Approve
                      </Button>
                      <Button size="sm" className="flex-1" variant="outline">
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <Button className="h-auto flex-col gap-2 py-6">
                <Users className="h-6 w-6" />
                <span>Manage Users</span>
              </Button>
              <Button className="h-auto flex-col gap-2 py-6" variant="outline">
                <Award className="h-6 w-6" />
                <span>Coin Management</span>
              </Button>
              <Button className="h-auto flex-col gap-2 py-6" variant="outline">
                <TrendingUp className="h-6 w-6" />
                <span>View Analytics</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
