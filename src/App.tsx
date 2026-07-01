import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import { LogOut, Plus, Trash2, CheckCircle, Circle } from 'lucide-react';

// استبدل الـ URL والـ Key ببياناتك من Supabase
const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_ANON_KEY');

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
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-full max-w-md bg-gray-800 p-8 rounded-xl">
          <h1 className="text-2xl font-bold mb-6">تسجيل الدخول</h1>
          <input className="w-full p-2 mb-4 bg-gray-700 rounded" placeholder="البريد الإلكتروني" onChange={(e) => setEmail(e.target.value)} />
          <input className="w-full p-2 mb-6 bg-gray-700 rounded" type="password" placeholder="كلمة المرور" onChange={(e) => setPassword(e.target.value)} />
          <button className="w-full bg-blue-600 p-2 rounded" onClick={() => supabase.auth.signInWithPassword({ email, password })}>دخول</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">مهامي</h1>
          <button onClick={() => supabase.auth.signOut()}><LogOut /></button>
        </div>

        <div className="flex gap-2 mb-6">
          <input className="flex-1 p-3 bg-gray-800 rounded" value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="إضافة مهمة جديدة..." />
          <button onClick={addTask} className="bg-blue-600 p-3 rounded"><Plus /></button>
        </div>

        {tasks.map((task) => (
          <motion.div key={task.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-800 p-4 mb-2 rounded flex justify-between">
            <span>{task.title}</span>
          </motion.div>
        ))}
      </div>

      <motion.footer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-auto pt-6 border-t border-gray-800 text-center text-gray-500 text-sm flex flex-col items-center gap-3">
        <p>مطوّر بواسطة <span className="text-blue-400 font-bold">Amr Shabaan</span></p>
        <div className="flex gap-4">
          <a href="https://wa.me/201040192603" target="_blank" className="hover:text-green-500">واتساب 💬</a>
          <a href="https://www.linkedin.com/in/amr-shabaan-aa9408353" target="_blank" className="hover:text-blue-500">LinkedIn 🔗</a>
        </div>
      </motion.footer>
    </div>
  );
}