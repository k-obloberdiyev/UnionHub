import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Clock } from "lucide-react";

const events = [
  {
    id: 1,
    title: "Welcome Week Kickoff",
    date: "2025-11-05",
    time: "18:00",
    location: "Main Auditorium",
    attendees: 150,
    maxAttendees: 200,
    category: "Social",
    description: "Start the semester with a bang! Meet new friends and learn about all our activities.",
    coins: 20,
    image: "🎉",
  },
  {
    id: 2,
    title: "International Culture Fair",
    date: "2025-11-12",
    time: "14:00",
    location: "Campus Plaza",
    attendees: 89,
    maxAttendees: 150,
    category: "Cultural",
    description: "Experience cultures from around the world with food, music, and performances.",
    coins: 25,
    image: "🌍",
  },
  {
    id: 3,
    title: "Tech Workshop: Web Development",
    date: "2025-11-15",
    time: "16:00",
    location: "IT Lab 3",
    attendees: 45,
    maxAttendees: 50,
    category: "Education",
    description: "Learn modern web development techniques with hands-on coding exercises.",
    coins: 30,
    image: "💻",
  },
  {
    id: 4,
    title: "Intramural Football Tournament",
    date: "2025-11-18",
    time: "15:00",
    location: "Sports Field",
    attendees: 64,
    maxAttendees: 80,
    category: "Sports",
    description: "Show your team spirit in our annual football tournament.",
    coins: 50,
    image: "⚽",
  },
  {
    id: 5,
    title: "Study Skills Workshop",
    date: "2025-11-20",
    time: "17:00",
    location: "Library Room 204",
    attendees: 38,
    maxAttendees: 60,
    category: "Education",
    description: "Master effective study techniques and time management strategies.",
    coins: 15,
    image: "📚",
  },
  {
    id: 6,
    title: "Community Service Day",
    date: "2025-11-22",
    time: "09:00",
    location: "City Park",
    attendees: 52,
    maxAttendees: 100,
    category: "Service",
    description: "Give back to the community with our environmental cleanup initiative.",
    coins: 40,
    image: "🤝",
  },
];

export default function Events() {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Social: "bg-primary",
      Cultural: "bg-accent text-accent-foreground",
      Education: "bg-success",
      Sports: "bg-warning",
      Service: "bg-secondary",
    };
    return colors[category] || "bg-muted";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Event Calendar</h1>
            <p className="text-muted-foreground">Discover and register for upcoming activities</p>
          </div>
          <Button>Create Event</Button>
        </div>

        <div className="grid gap-6">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-32 h-32 md:h-auto bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-6xl">
                  {event.image}
                </div>
                <div className="flex-1">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-xl">{event.title}</CardTitle>
                          <Badge className={getCategoryColor(event.category)}>
                            {event.category}
                          </Badge>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {event.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{new Date(event.date).toLocaleDateString('en-US', { 
                            month: 'long', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{event.attendees} / {event.maxAttendees} registered</span>
                        </div>
                      </div>
                      <div className="flex flex-col justify-between">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl">🪙</span>
                          <div>
                            <p className="text-xs text-muted-foreground">Earn</p>
                            <p className="text-lg font-bold text-coin-gold">+{event.coins} coins</p>
                          </div>
                        </div>
                        <Button className="w-full">
                          Register Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
