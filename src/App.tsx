import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, LogOut, Layout, Clock, CheckCircle, ListTodo } from 'lucide-react';

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

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('tasks').update({ status }).eq('id', id);
    fetchTasks();
  };

  if (!session) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white font-bold">يرجى تسجيل الدخول للوصول للوحة التحكم...</div>;

  const stats = [
    { label: 'الكل', val: tasks.length, icon: ListTodo, color: 'text-blue-400' },
    { label: 'قيد التنفيذ', val: tasks.filter(t => t.status === 'In Progress').length, icon: Clock, color: 'text-yellow-400' },
    { label: 'تم الإنجاز', val: tasks.filter(t => t.status === 'Done').length, icon: CheckCircle, color: 'text-green-400' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 font-sans">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">أهلاً، {session.user.email?.split('@')[0]} 👋</h1>
        <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-2 text-red-400 hover:text-red-300 transition">
          <LogOut size={18} /> خروج
        </button>
      </header>

      {/* Stats Section */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map((s, i) => (
          <div key={i} className="bg-gray-900 p-4 rounded-xl border border-gray-800 flex items-center gap-4">
            <s.icon className={`${s.color} w-8 h-8`} />
            <div>
              <div className="text-2xl font-bold">{s.val}</div>
              <div className="text-gray-500 text-xs">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Section */}
      <div className="flex gap-2 mb-8">
        <input 
          className="flex-1 p-3 bg-gray-900 rounded-xl border border-gray-800 outline-none focus:border-blue-500" 
          value={newTask} 
          onChange={(e) => setNewTask(e.target.value)} 
          placeholder="أضف مهمة جديدة..." 
        />
        <button onClick={addTask} className="bg-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-500 transition flex items-center gap-2">
          <Plus size={20} /> إضافة
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-3 gap-4">
        {['To Do', 'In Progress', 'Done'].map((status) => (
          <div key={status} className="bg-gray-900 p-4 rounded-xl border border-gray-800">
            <h2 className="font-bold mb-4 flex items-center gap-2 text-gray-300">
              <Layout size={18} /> {status}
            </h2>
            {tasks.filter(t => t.status === status).map(task => (
              <div key={task.id} className="bg-gray-800 p-4 mb-3 rounded-lg border border-gray-700 hover:border-gray-600 transition">
                <p className="font-medium mb-3">{task.title}</p>
                <select 
                  className="bg-gray-950 text-xs text-gray-400 p-1 rounded border border-gray-700 w-full" 
                  onChange={(e) => updateStatus(task.id, e.target.value)} 
                  value={task.status}
                >
                  <option value="To Do">📋 To Do</option>
                  <option value="In Progress">🚀 In Progress</option>
                  <option value="Done">✅ Done</option>
                </select>
              </div>
            ))}
            {tasks.filter(t => t.status === status).length === 0 && (
              <p className="text-gray-600 text-sm italic text-center py-4">لا توجد مهام هنا...</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}