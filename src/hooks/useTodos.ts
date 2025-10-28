import { useState, useEffect, useCallback } from "react";
import { Todo, initialTodos } from "@/data/todos";
import { showSuccess, showError } from "@/utils/toast";

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize database and load todos
  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      setLoading(true);
      
      // Create todos table if it doesn't exist
      await window.sqlite.createTable({
        tableName: "todos",
        schema: `
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          completed BOOLEAN DEFAULT 0,
          priority TEXT DEFAULT 'medium',
          category TEXT,
          dueDate TEXT,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL
        `
      });

      // Check if we have existing todos
      const result = await window.sqlite.queryData({
        query: "SELECT * FROM todos ORDER BY createdAt DESC",
        params: []
      });

      if (result.length === 0) {
        // Insert initial todos
        for (const todo of initialTodos) {
          await window.sqlite.insertData({
            tableName: "todos",
            data: {
              title: todo.title,
              description: todo.description,
              completed: todo.completed ? 1 : 0,
              priority: todo.priority,
              category: todo.category,
              dueDate: todo.dueDate,
              createdAt: todo.createdAt,
              updatedAt: todo.updatedAt
            }
          });
        }
        setTodos(initialTodos);
      } else {
        // Convert SQLite boolean to JavaScript boolean
        const loadedTodos = result.map((row: any) => ({
          ...row,
          completed: row.completed === 1,
          id: Number(row.id)
        }));
        setTodos(loadedTodos);
      }
    } catch (err) {
      console.error("Database initialization error:", err);
      setError("Failed to initialize database");
      showError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const addTodo = useCallback(async (todoData: Omit<Todo, "id" | "createdAt" | "updatedAt">) => {
    try {
      const now = new Date().toISOString();
      const newTodo = {
        ...todoData,
        createdAt: now,
        updatedAt: now
      };

      const result = await window.sqlite.insertData({
        tableName: "todos",
        data: {
          ...newTodo,
          completed: newTodo.completed ? 1 : 0
        }
      });

      const insertedTodo = {
        ...newTodo,
        id: result.id,
        completed: newTodo.completed
      };

      setTodos(prev => [insertedTodo, ...prev]);
      showSuccess("Task added successfully!");
    } catch (err) {
      console.error("Add todo error:", err);
      showError("Failed to add task");
    }
  }, []);

  const updateTodo = useCallback(async (id: number, updates: Partial<Todo>) => {
    try {
      const updatedAt = new Date().toISOString();
      
      await window.sqlite.updateData({
        tableName: "todos",
        data: {
          ...updates,
          completed: updates.completed !== undefined ? (updates.completed ? 1 : 0) : undefined,
          updatedAt
        },
        where: { id }
      });

      setTodos(prev => prev.map(todo => 
        todo.id === id 
          ? { ...todo, ...updates, updatedAt }
          : todo
      ));
      showSuccess("Task updated successfully!");
    } catch (err) {
      console.error("Update todo error:", err);
      showError("Failed to update task");
    }
  }, []);

  const deleteTodo = useCallback(async (id: number) => {
    try {
      await window.sqlite.deleteData({
        tableName: "todos",
        where: { id }
      });

      setTodos(prev => prev.filter(todo => todo.id !== id));
      showSuccess("Task deleted successfully!");
    } catch (err) {
      console.error("Delete todo error:", err);
      showError("Failed to delete task");
    }
  }, []);

  const toggleComplete = useCallback(async (id: number) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      await updateTodo(id, { completed: !todo.completed });
    }
  }, [todos, updateTodo]);

  return {
    todos,
    loading,
    error,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleComplete
  };
}