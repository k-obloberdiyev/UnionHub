export type TaskStatus = "pending" | "in-progress" | "completed";
export type DepartmentCode = 1|2|3|4|5|6|7;

export interface TaskItem {
  id: string;
  title: string;
  status: TaskStatus;
  coins: number;
  deadline: string; // ISO date
  department_code: DepartmentCode;
  description?: string;
}

// Example seed data. Edit/add tasks here to allocate them to departments via department_code.
export const tasks: TaskItem[] = [
  // Education (1)
  { id: "t-edu-1", title: "Organize Study Groups", status: "completed", coins: 50, deadline: "2025-11-10", department_code: 1 },
  { id: "t-edu-2", title: "Host Exam Prep Workshops", status: "in-progress", coins: 75, deadline: "2025-11-18", department_code: 1 },
  { id: "t-edu-3", title: "Create Resource Library", status: "pending", coins: 100, deadline: "2025-12-01", department_code: 1 },

  // Social Events (2)
  { id: "t-soc-1", title: "Welcome Week Party", status: "completed", coins: 100, deadline: "2025-09-01", department_code: 2 },
  { id: "t-soc-2", title: "Semester End Celebration", status: "in-progress", coins: 150, deadline: "2025-12-20", department_code: 2 },
  { id: "t-soc-3", title: "Monthly Social Mixers", status: "completed", coins: 50, deadline: "2025-11-01", department_code: 2 },

  // International Relations (3)
  { id: "t-int-1", title: "Culture Fair Planning", status: "in-progress", coins: 120, deadline: "2025-11-12", department_code: 3 },
  { id: "t-int-2", title: "Language Exchange Program", status: "pending", coins: 80, deadline: "2026-01-15", department_code: 3 },
  { id: "t-int-3", title: "International Buddy System", status: "completed", coins: 60, deadline: "2025-10-01", department_code: 3 },

  // Media (4)
  { id: "t-med-1", title: "Weekly Content Calendar", status: "completed", coins: 40, deadline: "2025-11-01", department_code: 4 },
  { id: "t-med-2", title: "Video Documentary Project", status: "in-progress", coins: 200, deadline: "2026-02-01", department_code: 4 },
  { id: "t-med-3", title: "Photography Workshop", status: "completed", coins: 70, deadline: "2025-11-08", department_code: 4 },

  // Sports (5)
  { id: "t-sp-1", title: "Intramural Tournament", status: "completed", coins: 150, deadline: "2025-10-20", department_code: 5 },
  { id: "t-sp-2", title: "Fitness Challenge Campaign", status: "in-progress", coins: 90, deadline: "2025-12-01", department_code: 5 },
  { id: "t-sp-3", title: "Sports Equipment Inventory", status: "pending", coins: 50, deadline: "2026-01-05", department_code: 5 },

  // Social Engagement (6)
  { id: "t-se-1", title: "Local Charity Drive", status: "completed", coins: 100, deadline: "2025-11-30", department_code: 6 },
  { id: "t-se-2", title: "Environmental Cleanup Day", status: "in-progress", coins: 80, deadline: "2025-12-15", department_code: 6 },
  { id: "t-se-3", title: "Senior Center Visit Program", status: "completed", coins: 70, deadline: "2025-10-05", department_code: 6 },

  // IT (7)
  { id: "t-it-1", title: "Website Maintenance", status: "completed", coins: 120, deadline: "2025-10-15", department_code: 7 },
  { id: "t-it-2", title: "Mobile App Development", status: "in-progress", coins: 300, deadline: "2026-03-01", department_code: 7 },
  { id: "t-it-3", title: "Tech Workshop Series", status: "completed", coins: 100, deadline: "2025-09-20", department_code: 7 },
];
