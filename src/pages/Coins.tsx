import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, TrendingUp, Trophy, Star } from "lucide-react";

const coinHistory = [
  { id: 1, activity: "Attended Welcome Week Event", coins: 20, date: "2025-10-28", type: "earned" },
  { id: 2, activity: "Completed IT Workshop", coins: 30, date: "2025-10-25", type: "earned" },
  { id: 3, activity: "Event Registration Fee", coins: -10, date: "2025-10-22", type: "spent" },
  { id: 4, activity: "Community Service Day", coins: 40, date: "2025-10-20", type: "earned" },
  { id: 5, activity: "Study Group Participation", coins: 15, date: "2025-10-18", type: "earned" },
  { id: 6, activity: "Feedback Survey Completed", coins: 5, date: "2025-10-15", type: "earned" },
];

const leaderboard = [
  { rank: 1, name: "Sarah Johnson", coins: 1250, avatar: "👩" },
  { rank: 2, name: "Mike Chen", coins: 1180, avatar: "👨" },
  { rank: 3, name: "Emma Wilson", coins: 1050, avatar: "👩" },
  { rank: 4, name: "Alex Rivera", coins: 890, avatar: "👨" },
  { rank: 5, name: "You", coins: 250, avatar: "⭐", isUser: true },
];

const rewards = [
  { id: 1, title: "Free Coffee at Campus Café", cost: 50, available: true },
  { id: 2, title: "Priority Event Registration", cost: 100, available: true },
  { id: 3, title: "UnionHub T-Shirt", cost: 200, available: true },
  { id: 4, title: "VIP Event Access Pass", cost: 500, available: false },
];

export default function Coins() {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coin System</h1>
          <p className="text-muted-foreground">Track your rewards and achievements</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-coin-gold/20 to-coin-shine/10 border-coin-gold/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-3xl animate-coin-spin">🪙</span>
                Your Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-coin-gold">250 coins</p>
              <p className="text-sm text-muted-foreground mt-2">+45 this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                Total Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">280 coins</p>
              <p className="text-sm text-muted-foreground mt-2">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-warning" />
                Your Rank
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">#5</p>
              <p className="text-sm text-muted-foreground mt-2">Top 10%</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your coin transaction history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {coinHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.activity}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div className={`font-bold text-lg ${item.type === 'earned' ? 'text-success' : 'text-destructive'}`}>
                      {item.type === 'earned' ? '+' : ''}{item.coins}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Leaderboard</CardTitle>
              <CardDescription>Top coin collectors this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((user) => (
                  <div
                    key={user.rank}
                    className={`flex items-center gap-4 p-3 rounded-lg ${
                      user.isUser ? 'bg-primary/10 border border-primary' : 'border'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`text-2xl font-bold ${
                        user.rank === 1 ? 'text-warning' : 
                        user.rank === 2 ? 'text-muted-foreground' : 
                        user.rank === 3 ? 'text-warning/60' : ''
                      }`}>
                        {user.rank <= 3 && <Award className="inline h-5 w-5 mr-1" />}
                        #{user.rank}
                      </div>
                      <div className="text-2xl">{user.avatar}</div>
                      <span className={`font-medium ${user.isUser ? 'text-primary' : ''}`}>
                        {user.name}
                      </span>
                    </div>
                    <Badge variant={user.isUser ? "default" : "outline"} className="font-bold">
                      {user.coins} 🪙
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Available Rewards</CardTitle>
            <CardDescription>Redeem your coins for exclusive perks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {rewards.map((reward) => (
                <Card key={reward.id} className={!reward.available ? 'opacity-50' : ''}>
                  <CardHeader>
                    <CardTitle className="text-base">{reward.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-coin-gold">{reward.cost}</span>
                        <span className="text-xl">🪙</span>
                      </div>
                      <button
                        disabled={!reward.available}
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                          reward.available
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                            : 'bg-muted text-muted-foreground cursor-not-allowed'
                        }`}
                      >
                        {reward.available ? 'Redeem' : 'Coming Soon'}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
