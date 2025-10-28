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
      setError(null);
      
      console.log("Starting database initialization...");
      
      // Check if window.sqlite is available
      if (!window.sqlite) {
        console.error("SQLite MCP server not available - falling back to local storage");
        setError("SQLite MCP server not available - using local storage fallback");
        
        // Fallback to localStorage
        const savedTodos = localStorage.getItem('todos');
        if (savedTodos) {
          setTodos(JSON.parse(savedTodos));
        } else {
          setTodos(initialTodos);
          localStorage.setItem('todos', JSON.stringify(initialTodos));
        }
        setLoading(false);
        return;
      }

      console.log("SQLite MCP server available, creating todos table...");
      
      // Create todos table if it doesn't exist
      try {
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
        console.log("Todos table created successfully");
      } catch (tableError) {
        console.log("Table might already exist or creation failed:", tableError);
        // Continue even if table creation fails
      }

      // Try to load existing todos
      try {
        const result = await window.sqlite.queryData({
          query: "SELECT * FROM todos ORDER BY createdAt DESC",
          params: []
        });
        console.log("Loaded todos from database:", result);

        if (result.length === 0) {
          console.log("No existing todos, inserting initial data...");
          // Insert initial todos
          for (const todo of initialTodos) {
            try {
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
            } catch (insertError) {
              console.log("Error inserting todo:", insertError);
            }
          }
          setTodos(initialTodos);
          console.log("Initial todos inserted successfully");
        } else {
          // Convert SQLite boolean to JavaScript boolean
          const loadedTodos = result.map((row: any) => ({
            ...row,
            completed: row.completed === 1,
            id: Number(row.id)
          }));
          setTodos(loadedTodos);
          console.log("Todos loaded from database successfully");
        }
      } catch (queryError) {
        console.error("Database query failed:", queryError);
        throw new Error("Failed to query database");
      }
    } catch (err) {
      console.error("Database initialization error:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown database error";
      setError(`Failed to initialize database: ${errorMessage}`);
      showError("Failed to load tasks from database");
      
      // Fallback to localStorage
      console.log("Falling back to localStorage...");
      try {
        const savedTodos = localStorage.getItem('todos');
        if (savedTodos) {
          setTodos(JSON.parse(savedTodos));
        } else {
          setTodos(initialTodos);
          localStorage.setItem('todos', JSON.stringify(initialTodos));
        }
      } catch (fallbackError) {
        console.error("LocalStorage fallback also failed:", fallbackError);
      }
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

      if (window.sqlite) {
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
      } else {
        // Fallback to localStorage
        const maxId = Math.max(...todos.map(t => t.id), 0);
        const insertedTodo = {
          ...newTodo,
          id: maxId + 1,
          completed: newTodo.completed
        };
        const updatedTodos = [insertedTodo, ...todos];
        setTodos(updatedTodos);
        localStorage.setItem('todos', JSON.stringify(updatedTodos));
      }
      
      showSuccess("Task added successfully!");
    } catch (err) {
      console.error("Add todo error:", err);
      showError("Failed to add task");
    }
  }, [todos]);

  const updateTodo = useCallback(async (id: number, updates: Partial<Todo>) => {
    try {
      const updatedAt = new Date().toISOString();
      
      if (window.sqlite) {
        await window.sqlite.updateData({
          tableName: "todos",
          data: {
            ...updates,
            completed: updates.completed !== undefined ? (updates.completed ? 1 : 0) : undefined,
            updatedAt
          },
          where: { id }
        });
      }

      setTodos(prev => prev.map(todo => 
        todo.id === id 
          ? { ...todo, ...updates, updatedAt }
          : todo
      ));

      // Update localStorage
      if (!window.sqlite) {
        const updatedTodos = todos.map(todo => 
          todo.id === id ? { ...todo, ...updates, updatedAt } : todo
        );
        localStorage.setItem('todos', JSON.stringify(updatedTodos));
      }
      
      showSuccess("Task updated successfully!");
    } catch (err) {
      console.error("Update todo error:", err);
      showError("Failed to update task");
    }
  }, [todos]);

  const deleteTodo = useCallback(async (id: number) => {
    try {
      if (window.sqlite) {
        await window.sqlite.deleteData({
          tableName: "todos",
          where: { id }
        });
      }

      setTodos(prev => prev.filter(todo => todo.id !== id));
      
      // Update localStorage
      if (!window.sqlite) {
        const updatedTodos = todos.filter(todo => todo.id !== id);
        localStorage.setItem('todos', JSON.stringify(updatedTodos));
      }
      
      showSuccess("Task deleted successfully!");
    } catch (err) {
      console.error("Delete todo error:", err);
      showError("Failed to delete task");
    }
  }, [todos]);

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