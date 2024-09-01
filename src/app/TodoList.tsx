import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

interface Todo {
  id: string;
  content: string;
  is_completed: boolean;
  created_at: string;
}

const TodoList = ({ searchQuery }: { searchQuery: string }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);

  useEffect(() => {
    fetchTodos();

    const todoChannel = supabase
      .channel('todos')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'todos' },
        fetchTodos
      )
      .subscribe();

    return () => {
      supabase.removeChannel(todoChannel);
    };
  }, []);

  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from('todos')
      .select()
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching todos:', error);
    } else {
      setTodos(data || []);
    }
  };

  const addOrEditTodo = async () => {
    if (!newTodo.trim()) {
      setError('Todo cannot be empty');
      return;
    }

    const isDuplicate = todos.some(
      (todo) => todo.content.toLowerCase() === newTodo.trim().toLowerCase()
    );

    if (isDuplicate) {
      setError('Todo already exists');
      return;
    }

    if (isEditing && editingTodoId) {
      const { error } = await supabase
        .from('todos')
        .update({ content: newTodo })
        .eq('id', editingTodoId);

      if (!error) {
        setTodos((prevData) =>
          prevData.map((item) =>
            item.id === editingTodoId ? { ...item, content: newTodo } : item
          )
        );
        setIsEditing(false);
        setEditingTodoId(null);
      }
    } else {
      const { data, error } = await supabase
        .from('todos')
        .insert({ content: newTodo })
        .select();

      if (error) console.error('Error fetching todos:', error);
      else {
        setTodos((prevTodos) => [data[0], ...prevTodos]);
      }
    }

    setNewTodo('');
    setError(null);
  };

  const deleteTodo = async (id: string) => {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)
      .select();

    if (error) console.error('Error deleting todo:', error);
    else {
      setTodos((prevData) => prevData.filter((item) => item.id !== id));
    }
  };

  const toggleDone = async (todo: Todo) => {
    const is_completed = todo.is_completed;
    const { error } = await supabase
      .from('todos')
      .update({ is_completed: !is_completed })
      .eq('id', todo.id);

    if (!error) {
      setTodos((prevData) =>
        prevData.map((item) =>
          item.id === todo.id ? { ...item, is_completed: !is_completed } : item
        )
      );
    }
  };

  const toggleEditingTodo = (todo: Todo) => {
    if (isEditing && editingTodoId === todo.id) {
      setIsEditing(false);
      setEditingTodoId(null);
      setNewTodo('');
    } else {
      setNewTodo(todo.content);
      setIsEditing(true);
      setEditingTodoId(todo.id);
    }
  };

  const filteredTodos = todos.filter((todo) =>
    todo.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-[800px] min-h-5">
      <div className="mb-5">
        <input
          id="new_todo"
          type="text"
          value={newTodo}
          onChange={(e) => {
            setNewTodo(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={(e) => e.key === 'Enter' && addOrEditTodo()}
          className="border w-full border-gray-300 rounded-md py-1 px-2 placeholder:text-sm"
          placeholder={
            isEditing ? 'Edit your todo' : 'Something you have to do'
          }
        />
        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
      </div>

      {filteredTodos.map((todo) => (
        <div key={todo.id} className="flex mb-3">
          <div className="w-[60%] flex gap-2 items-center">
            <button
              className={`border w-4 h-4 rounded-sm ${
                todo.is_completed ? 'bg-green-500' : 'border-green-500'
              }`}
              onClick={() => toggleDone(todo)}
            ></button>
            <div
              className={`content ${todo.is_completed ? 'line-through' : ''}`}
            >
              <div key={todo.id}>{todo.content}</div>
            </div>
          </div>
          <div className="w-[40%] flex justify-end gap-4">
            <button
              className="text-xs border border-red-300 py-1 px-3 text-red-500 rounded-md"
              onClick={() => deleteTodo(todo.id)}
            >
              Remove
            </button>
            <button
              className={`text-xs border py-1 px-3 rounded-md ${
                isEditing && editingTodoId === todo.id
                  ? 'border-orange-300 text-orange-500'
                  : 'border-blue-300 text-blue-500'
              }`}
              onClick={() => toggleEditingTodo(todo)}
            >
              {isEditing && editingTodoId === todo.id ? 'Editing' : 'Edit'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TodoList;
