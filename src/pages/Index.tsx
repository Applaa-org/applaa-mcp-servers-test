import { useState, useMemo } from "react";
import Header from "@/components/Header";
import TodoItem from "@/components/TodoItem";
import TodoForm from "@/components/TodoForm";
import TodoStats from "@/components/TodoStats";
import { Todo } from "@/data/todos";
import { useTodos } from "@/hooks/useTodos";
import DebugPanel from "@/components/DebugPanel";
import { MadeWithApplaa } from "@/components/made-with-applaa";
import { Bug } from "lucide-react";

export default function Index() {
  const { todos, loading, error, addTodo, updateTodo, deleteTodo, toggleComplete } = useTodos();
  const [formOpen, setFormOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | undefined>();
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debugOpen, setDebugOpen] = useState(false);

  // Debug information
  console.log("Todo App State:", {
    todosCount: todos.length,
    loading,
    error,
    sqliteAvailable: typeof window !== 'undefined' && 'sqlite' in window
  });

  const filteredTodos = useMemo(() => {
    let filtered = todos;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(todo =>
        todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        todo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        todo.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    switch (filter) {
      case "active":
        filtered = filtered.filter(todo => !todo.completed);
        break;
      case "completed":
        filtered = filtered.filter(todo => todo.completed);
        break;
    }

    // Apply priority filter
    if (["high", "medium", "low"].includes(filter)) {
      filtered = filtered.filter(todo => todo.priority === filter);
    }

    return filtered;
  }, [todos, filter, searchTerm]);

  const handleAddTodo = () => {
    setEditingTodo(undefined);
    setFormOpen(true);
  };

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setFormOpen(true);
  };

  const handleFormSubmit = async (todoData: Omit<Todo, "id" | "createdAt" | "updatedAt">) => {
    if (editingTodo) {
      await updateTodo(editingTodo.id, todoData);
    } else {
      await addTodo(todoData);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tasks...</p>
          {error && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> {error}
              </p>
              <p className="text-xs text-yellow-600 mt-2">
                Using local storage as fallback. Check console for details.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error && todos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Database Connection Issue</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">Troubleshooting:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Ensure SQLite MCP server is running</li>
              <li>• Check browser console for detailed error logs</li>
              <li>• App is using localStorage as fallback</li>
            </ul>
          </div>
          <button
            onClick={() => setDebugOpen(true)}
            className="mt-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors mx-auto"
          >
            <Bug className="w-4 h-4" />
            Debug Information
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onAddTodo={handleAddTodo}
        onFilterChange={setFilter}
        onSearchChange={setSearchTerm}
        currentFilter={filter}
      />
      
      <main className="container mx-auto px-4 py-8">
        <TodoStats todos={todos} />
        
        {filteredTodos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {searchTerm || filter !== "all" ? "No tasks found" : "No tasks yet"}
            </h3>
            <p className="text-gray-500">
              {searchTerm || filter !== "all" 
                ? "Try adjusting your search or filter criteria" 
                : "Add your first task to get started!"}
            </p>
            {error && (
              <p className="text-sm text-yellow-600 mt-2">
                Using local storage fallback due to database connection issue.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggleComplete={toggleComplete}
                onEdit={handleEditTodo}
                onDelete={deleteTodo}
              />
            ))}
          </div>
        )}
      </main>

      <TodoForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        editingTodo={editingTodo}
      />

      <MadeWithApplaa />

      {debugOpen && (
        <DebugPanel onClose={() => setDebugOpen(false)} />
      )}
    </div>
  );
}