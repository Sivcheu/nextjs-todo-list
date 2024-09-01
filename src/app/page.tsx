'use client';

import { useState } from 'react';
import TodoList from './TodoList';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <main className="bg-gray-50 h-screen w-full flex justify-center p-10">
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h1 className="heading-1 mb-3">Todo lists</h1>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border w-[30%] border-gray-300 rounded-md py-1 px-2 placeholder:text-sm"
            placeholder="Search..."
          />
        </div>

        <TodoList searchQuery={searchQuery} />
      </div>
    </main>
  );
}
