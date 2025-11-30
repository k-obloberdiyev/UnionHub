export interface TaskItem {
  id: string;
  title: string;
  status: string;
  coins: number;
  deadline: string;
  department_code: number;
  description?: string;
  progress?: {
    current: number;
    target: number;
    unit?: string;
  };
  evaluation?: {
    completed: boolean;
    score?: number;
    feedback?: string;
    evaluated_at?: string;
    evaluated_by?: string;
  };
}

export function getTasksForDepartment(tasks: TaskItem[], deptId: number) {
  return tasks.filter((t) => String(t.department_code) === String(deptId));
}

export function computeDepartmentProgress(tasks: TaskItem[], deptId: number) {
  const deptTasks = getTasksForDepartment(tasks, deptId);
  const total = deptTasks.length;
  if (total === 0) return 0;
  const completed = deptTasks.filter((t) => t.status === "completed" || t.status === "evaluated").length;
  return Math.round((completed / total) * 100);
}

export function computeDepartmentMetrics(tasks: TaskItem[], deptId: number) {
  const now = new Date();
  const deptTasks = getTasksForDepartment(tasks, deptId);
  const total = deptTasks.length;
  const completed = deptTasks.filter((t) => t.status === "completed" || t.status === "evaluated").length;
  const inProgress = deptTasks.filter((t) => t.status === "in-progress").length;
  const pending = deptTasks.filter((t) => t.status === "pending").length;
  const overdueOpen = deptTasks.filter((t) => new Date(t.deadline) < now && t.status !== "completed" && t.status !== "evaluated").length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  const credibility = Math.max(0, 100 - overdueOpen * 10);
  const dueNext7 = deptTasks.filter((t) => {
    const d = new Date(t.deadline);
    const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  }).length;
  
  // Calculate average evaluation score for evaluated tasks
  const evaluatedTasks = deptTasks.filter((t) => t.evaluation?.completed);
  const avgEvaluationScore = evaluatedTasks.length > 0 
    ? Math.round(evaluatedTasks.reduce((sum, t) => sum + (t.evaluation?.score || 0), 0) / evaluatedTasks.length)
    : 0;
  
  return { total, completed, inProgress, pending, overdueOpen, progress, credibility, dueNext7, avgEvaluationScore };
}
