export interface Todo {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export const initialTodos: Todo[] = [
  {
    id: 1,
    title: "Complete project documentation",
    description: "Write comprehensive documentation for the new feature release",
    completed: false,
    priority: "high",
    category: "Work",
    dueDate: "2024-01-20",
    createdAt: "2024-01-15T09:00:00Z",
    updatedAt: "2024-01-15T09:00:00Z"
  },
  {
    id: 2,
    title: "Review pull requests",
    description: "Review and provide feedback on pending PRs",
    completed: true,
    priority: "medium",
    category: "Development",
    dueDate: "2024-01-16",
    createdAt: "2024-01-14T14:30:00Z",
    updatedAt: "2024-01-15T10:15:00Z"
  },
  {
    id: 3,
    title: "Update dependencies",
    description: "Update all npm packages to latest stable versions",
    completed: false,
    priority: "low",
    category: "Maintenance",
    createdAt: "2024-01-13T11:00:00Z",
    updatedAt: "2024-01-13T11:00:00Z"
  },
  {
    id: 4,
    title: "Team meeting preparation",
    description: "Prepare agenda and slides for weekly team sync",
    completed: false,
    priority: "medium",
    category: "Meetings",
    dueDate: "2024-01-18",
    createdAt: "2024-01-12T16:00:00Z",
    updatedAt: "2024-01-12T16:00:00Z"
  },
  {
    id: 5,
    title: "Code refactoring",
    description: "Refactor authentication module for better performance",
    completed: true,
    priority: "high",
    category: "Development",
    createdAt: "2024-01-10T08:30:00Z",
    updatedAt: "2024-01-11T15:45:00Z"
  },
  {
    id: 6,
    title: "Database backup",
    description: "Schedule and verify weekly database backup",
    completed: false,
    priority: "high",
    category: "Maintenance",
    dueDate: "2024-01-19",
    createdAt: "2024-01-09T13:00:00Z",
    updatedAt: "2024-01-09T13:00:00Z"
  }
];

export const categories = ["Work", "Development", "Maintenance", "Meetings", "Personal", "Shopping", "Health"];