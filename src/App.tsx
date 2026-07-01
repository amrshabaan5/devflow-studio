import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import { LogOut, Plus } from 'lucide-react';

// ربط المشروع بـ Supabase باستخدام المتغيرات في Vercel
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
  }, []);

  const fetchTasks = async () => {
    if (!session) return;
    const { data } = await supabase.from('tasks').select('*').eq('user_id', session.user.id);
    setTasks(data || []);
  };

  useEffect(() => { fetchTasks(); }, [session]);

  const addTask = async () => {
    if (!newTask.trim() || !session) return;
    await supabase.from('tasks').insert([{ title: newTask, user_id: session.user.id }]);
    setNewTask('');
    fetchTasks();
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-full max-w-md bg-gray-800 p-8 rounded-xl shadow-2xl">
          <h1 className="text-2xl font-bold mb-6 text-center">تسجيل الدخول</h1>
          <input className="w-full p-3 mb-4 bg-gray-700 rounded border border-gray-600 outline-none focus:border-blue-500" placeholder="البريد الإلكتروني" onChange={(e) => setEmail(e.target.value)} />
          <input className="w-full p-3 mb-6 bg-gray-700 rounded border border-gray-600 outline-none focus:border-blue-500" type="password" placeholder="كلمة المرور" onChange={(e) => setPassword(e.target.value)} />
          <button className="w-full bg-blue-600 p-3 rounded font-bold hover:bg-blue-700 transition" onClick={() => supabase.auth.signInWithPassword({ email, password })}>دخول</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">مهامي اليومية</h1>
          <button onClick={() => supabase.auth.signOut()} className="text-gray-400 hover:text-red-400"><LogOut /></button>
        </div>

        <div className="flex gap-2 mb-6">
          <input className="flex-1 p-3 bg-gray-800 rounded border border-gray-700 outline-none focus:border-blue-500" value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="أضف مهمة جديدة..." />
          <button onClick={addTask} className="bg-blue-600 p-3 rounded hover:bg-blue-700 transition"><Plus /></button>
        </div>

        {tasks.map((task) => (
          <motion.div key={task.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-800 p-4 mb-2 rounded border border-gray-700 flex justify-between items-center">
            <span>{task.title}</span>
          </motion.div>
        ))}
      </div>

      <footer className="mt-auto pt-6 text-center text-gray-500 text-sm">
        <p>مطوّر بواسطة <span className="text-blue-400 font-bold">Amr Shabaan</span></p>
      </footer>
    </div>
  );
}