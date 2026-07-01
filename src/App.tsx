import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Auth from './components/Auth';
import { motion, AnimatePresence } from 'framer-motion';

const translations = {
  ar: { title: "DevFlow Studio", logout: "خروج", placeholder: "إضافة مهمة جديدة...", add: "إضافة", pending: "قيد الانتظار", doing: "جاري العمل", done: "تم الانتهاء", delete: "حذف", langBtn: "English" },
  en: { title: "DevFlow Studio", logout: "Logout", placeholder: "Add a new task...", add: "Add", pending: "Pending", doing: "In Progress", done: "Completed", delete: "Delete", langBtn: "العربية" }
};

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [tasks, setTasks] = useState<any[]>(() => {
    const saved = localStorage.getItem('myDevFlowTasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    localStorage.setItem('myDevFlowTasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    supabase.auth.onAuthStateChange((_, session) => setSession(session));
  }, []);

  const toggleLanguage = () => {
    const nextLang = lang === 'ar' ? 'en' : 'ar';
    setLang(nextLang);
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    const timeString = new Date().toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' });
    setTasks([...tasks, { id: Date.now().toString(), text: newTask, status: 'pending', date: timeString }]);
    setNewTask('');
  };

  const moveTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: t.status === 'pending' ? 'doing' : t.status === 'doing' ? 'done' : 'pending' } : t));
  };

  const deleteTask = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  if (!session) return <Auth onAuthSuccess={() => window.location.reload()} />;

  const t = translations[lang];
  const isRtl = lang === 'ar';

  return (
    <div className="min-h-screen bg-[#07070c] text-white p-4 md:p-8 lg:p-12 font-sans overflow-x-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
      <header className="max-w-6xl mx-auto mb-8 backdrop-blur-md bg-[#111122]/40 p-4 rounded-2xl border border-white/5 shadow-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">{t.title}</h1>
          <div className="flex items-center gap-3">
            <button onClick={toggleLanguage} className="px-4 py-2 text-xs font-bold uppercase bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">{t.langBtn}</button>
            <button onClick={() => supabase.auth.signOut()} className="bg-red-500/10 text-red-400 px-5 py-2 rounded-xl text-sm font-semibold border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">{t.logout}</button>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {[{ id: 'pending', label: t.pending, color: 'text-blue-400' }, { id: 'doing', label: t.doing, color: 'text-yellow-400' }, { id: 'done', label: t.done, color: 'text-green-400' }].map((col) => (
            <div key={col.id} className="p-3 rounded-xl border border-white/5 bg-white/5 text-center">
              <p className="text-[10px] uppercase opacity-70">{col.label}</p>
              <p className="text-xl md:text-3xl font-black">{tasks.filter(tk => tk.status === col.id).length}</p>
            </div>
          ))}
        </div>
      </header>

      <div className="max-w-2xl mx-auto mb-12 flex gap-3 bg-[#111122]/30 p-2 rounded-2xl border border-white/5 backdrop-blur-sm">
        <input value={newTask} onChange={(e) => setNewTask(e.target.value)} className="bg-transparent px-4 py-3 w-full outline-none" placeholder={t.placeholder} />
        <button onClick={addTask} className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 rounded-xl font-bold transition-all hover:scale-95">{t.add}</button>
      </div>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {[
          { id: 'pending', title: t.pending, dot: 'bg-blue-400', text: 'text-blue-400' },
          { id: 'doing', title: t.doing, dot: 'bg-yellow-400', text: 'text-yellow-400' },
          { id: 'done', title: t.done, dot: 'bg-green-400', text: 'text-green-400' }
        ].map(col => (
          <div key={col.id} className="bg-[#111122]/40 p-6 rounded-2xl border border-white/5 min-h-[500px]">
            <h3 className={`font-bold mb-6 flex items-center gap-2.5 ${col.text}`}>
              <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`}></span>{col.title}
            </h3>
            <div className="space-y-3.5">
              <AnimatePresence>
                {tasks.filter(t => t.status === col.id).map(task => (
                  <motion.div 
                    key={task.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => moveTask(task.id)}
                    className="bg-[#16162a]/80 p-4 rounded-xl border border-white/5 hover:border-white/10 cursor-pointer shadow-md"
                  >
                    <p className="text-sm md:text-base leading-relaxed">{task.text}</p>
                    <div className="flex justify-between items-center text-[10px] text-gray-500 mt-3 pt-2 border-t border-white/5">
                      <span className="font-mono">{task.date}</span>
                      <button onClick={(e) => deleteTask(e, task.id)} className="text-red-500/70 hover:text-red-400">{t.delete}</button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}