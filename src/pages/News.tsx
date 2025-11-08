import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, Eye } from "lucide-react";

const newsItems = [
  {
    id: 1,
    title: "Record Turnout at Welcome Week Events",
    excerpt: "Over 300 students participated in our Welcome Week activities, making it the most successful orientation yet.",
    author: "Sarah Johnson",
    date: "2025-10-28",
    category: "Events",
    image: "📸",
    likes: 45,
    comments: 12,
    views: 234,
  },
  {
    id: 2,
    title: "New Sustainability Initiative Launched",
    excerpt: "The Social Engagement team introduces a campus-wide recycling program to reduce our environmental footprint.",
    author: "Mike Chen",
    date: "2025-10-25",
    category: "Social Impact",
    image: "🌱",
    likes: 67,
    comments: 23,
    views: 456,
  },
  {
    id: 3,
    title: "IT Department Wins Hackathon",
    excerpt: "Our student developers took first place at the Regional University Hackathon with their innovative campus app.",
    author: "Alex Rivera",
    date: "2025-10-22",
    category: "Achievement",
    image: "🏆",
    likes: 89,
    comments: 34,
    views: 678,
  },
  {
    id: 4,
    title: "International Food Festival This Weekend",
    excerpt: "Join us for a culinary journey around the world with dishes from 20+ countries prepared by our international students.",
    author: "Emma Wilson",
    date: "2025-10-20",
    category: "Culture",
    image: "🍜",
    likes: 112,
    comments: 45,
    views: 892,
  },
];

export default function News() {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">News & Updates</h1>
            <p className="text-muted-foreground">Stay informed with the latest from our community</p>
          </div>
          <Button>Create Post</Button>
        </div>

        <div className="grid gap-6">
          {newsItems.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-48 h-48 md:h-auto bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-8xl">
                  {item.image}
                </div>
                <div className="flex-1">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{item.category}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                    <CardTitle className="text-xl hover:text-primary cursor-pointer transition-colors">
                      {item.title}
                    </CardTitle>
                    <CardDescription className="text-base mt-2">
                      {item.excerpt}
                    </CardDescription>
                    <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                      <span>By {item.author}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                          <Heart className="h-4 w-4" />
                          <span>{item.likes}</span>
                        </button>
                        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                          <MessageCircle className="h-4 w-4" />
                          <span>{item.comments}</span>
                        </button>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Eye className="h-4 w-4" />
                          <span>{item.views}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
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
