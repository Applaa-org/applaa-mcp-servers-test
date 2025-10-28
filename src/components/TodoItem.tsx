import { useState } from "react";
import { Todo } from "@/data/todos";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Edit, 
  Trash2, 
  Calendar,
  Flag,
  Clock,
  CheckCircle2,
  Circle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TodoItemProps {
  todo: Todo;
  onToggleComplete: (id: number) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
}

export default function TodoItem({ todo, onToggleComplete, onEdit, onDelete }: TodoItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Work: "bg-blue-100 text-blue-800",
      Development: "bg-purple-100 text-purple-800",
      Maintenance: "bg-orange-100 text-orange-800",
      Meetings: "bg-indigo-100 text-indigo-800",
      Personal: "bg-pink-100 text-pink-800",
      Shopping: "bg-teal-100 text-teal-800",
      Health: "bg-emerald-100 text-emerald-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed;

  return (
    <>
      <Card className={cn(
        "p-4 mb-3 transition-all hover:shadow-md",
        isOverdue ? "border-l-4 border-l-red-500" : "",
        todo.completed ? "opacity-75" : ""
      )}>
        <div className="flex items-start space-x-3">
          <Checkbox
            checked={todo.completed}
            onCheckedChange={() => onToggleComplete(todo.id)}
            className="mt-1"
          />
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className={cn(
                "font-semibold text-lg",
                todo.completed ? "line-through text-gray-500" : ""
              )}>
                {todo.title}
              </h3>
              
              <div className="flex items-center space-x-2">
                <Badge className={cn("text-xs", getPriorityColor(todo.priority))}>
                  <Flag className="w-3 h-3 mr-1" />
                  {todo.priority}
                </Badge>
                
                {todo.category && (
                  <Badge className={cn("text-xs", getCategoryColor(todo.category))}>
                    {todo.category}
                  </Badge>
                )}
              </div>
            </div>
            
            {todo.description && (
              <p className={cn(
                "text-sm text-gray-600",
                todo.completed ? "line-through" : ""
              )}>
                {todo.description}
              </p>
            )}
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              {todo.dueDate && (
                <div className={cn(
                  "flex items-center space-x-1",
                  isOverdue ? "text-red-600 font-medium" : ""
                )}>
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(todo.dueDate), "MMM dd, yyyy")}</span>
                  {isOverdue && <span className="text-red-600">(Overdue)</span>}
                </div>
              )}
              
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{format(new Date(todo.createdAt), "MMM dd, yyyy")}</span>
              </div>
              
              {todo.completed && (
                <div className="flex items-center space-x-1 text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Completed</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(todo)}
              className="hover:bg-blue-100 hover:text-blue-600"
            >
              <Edit className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="hover:bg-red-100 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{todo.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(todo.id);
                setShowDeleteDialog(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}