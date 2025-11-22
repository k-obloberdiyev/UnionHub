export interface DepartmentItem {
  id: number;
  name: string;
  emoji: string;
  description?: string;
  members?: number;
}

export const departments: DepartmentItem[] = [
  { id: 1, name: "Education", emoji: "📚", description: "Academic workshops and tutoring programs", members: 28 },
  { id: 2, name: "Social Events", emoji: "🎉", description: "Student parties and social gatherings", members: 35 },
  { id: 3, name: "International Relations", emoji: "🌍", description: "Cultural exchange and international student support", members: 22 },
  { id: 4, name: "Media", emoji: "📸", description: "Content creation and social media management", members: 18 },
  { id: 5, name: "Sports", emoji: "⚽", description: "Athletic events and fitness activities", members: 42 },
  { id: 6, name: "Social Engagement", emoji: "🤝", description: "Community service and volunteer programs", members: 31 },
  { id: 7, name: "IT", emoji: "💻", description: "Tech support and digital infrastructure", members: 15 },
];
