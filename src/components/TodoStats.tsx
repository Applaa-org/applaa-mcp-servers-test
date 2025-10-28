import { Todo } from "@/data/todos";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
  CheckCircle2, 
  Circle, 
  Flag,
  Calendar,
  TrendingUp 
} from "lucide-react";

interface TodoStatsProps {
  todos: Todo[];
}

export default function TodoStats({ todos }: TodoStatsProps) {
  const totalTasks = todos.length;
  const completedTasks = todos.filter(todo => todo.completed).length;
  const activeTasks = totalTasks - completedTasks;
  const overdueTasks = todos.filter(todo => 
    todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed
  ).length;
  
  const highPriorityTasks = todos.filter(todo => todo.priority === "high" && !todo.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const stats = [
    {
      title: "Total Tasks",
      value: totalTasks,
      icon: Circle,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Completed",
      value: completedTasks,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Active",
      value: activeTasks,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    {
      title: "High Priority",
      value: highPriorityTasks,
      icon: Flag,
      color: "text-red-600",
      bgColor: "bg-red-100"
    },
    {
      title: "Overdue",
      value: overdueTasks,
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Completion Rate",
      value: `${completionRate}%`,
      icon: TrendingUp,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card key={index} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
            <div className={cn("p-3 rounded-lg", stat.bgColor)}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}