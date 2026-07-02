import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, LogOut, Layout, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
  }, []);

  const fetchTasks = async () => {
    if (!session) return;
    const { data } = await supabase.from('tasks').select('*').eq('user_id', session.user.id);
    setTasks(data || []);
  };

  useEffect(() => { if (session) fetchTasks(); }, [session]);

  const addTask = async () => {
    if (!newTask.trim() || !session) return;
    await supabase.from('tasks').insert([{ title: newTask, user_id: session.user.id, status: 'To Do' }]);
    setNewTask('');
    fetchTasks();
  };

  const moveTask = async (id: number, currentStatus: string, direction: 'left' | 'right') => {
    const statuses = ['To Do', 'In Progress', 'Done'];
    const currentIndex = statuses.indexOf(currentStatus);
    const nextIndex = direction === 'right' ? currentIndex + 1 : currentIndex - 1;

    if (nextIndex >= 0 && nextIndex < statuses.length) {
      const newStatus = statuses[nextIndex];
      setTasks(prevTasks => prevTasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
      const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', id);
      if (error) { console.error(error); fetchTasks(); }
    }
  };

  if (!session) return <div className="p-10 text-white min-h-screen bg-gray-950 flex items-center justify-center">يرجى تسجيل الدخول...</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 font-sans">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Layout size={28} className="text-blue-500" /> DevFlow Studio
        </h1>
        <button onClick={() => supabase.auth.signOut()} className="text-red-400 flex items-center gap-2">
          <LogOut size={18} /> خروج
        </button>
      </header>

      <div className="flex gap-2 mb-8">
        <input 
          className="flex-1 p-3 bg-gray-900 rounded-xl border border-gray-800" 
          value={newTask} 
          onChange={(e) => setNewTask(e.target.value)} 
          placeholder="أضف مهمة جديدة..." 
        />
        <button onClick={addTask} className="bg-blue-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2">
          <Plus size={20} /> إضافة
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {['To Do', 'In Progress', 'Done'].map((status) => (
          <div key={status} className="bg-gray-900 p-4 rounded-xl border border-gray-800 min-h-[400px]">
            <h2 className="font-bold mb-4 text-gray-300 flex items-center gap-2">
              {status}
            </h2>
            <AnimatePresence>
              {tasks.filter(t => t.status === status).map((task) => (
                <motion.div 
                  key={task.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-gray-800 p-4 mb-3 rounded-lg border border-gray-700 flex justify-between items-center"
                >
                  <p className="font-medium">{task.title}</p>
                  <div className="flex gap-1">
                    {status !== 'To Do' && <button onClick={() => moveTask(task.id, status, 'left')} className="p-1 hover:bg-gray-700 rounded"><ChevronLeft size={16}/></button>}
                    {status !== 'Done' && <button onClick={() => moveTask(task.id, status, 'right')} className="p-1 hover:bg-gray-700 rounded"><ChevronRight size={16}/></button>}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}