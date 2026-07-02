import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, LogOut, Layout, AlertCircle, Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState('');
  const [priority, setPriority] = useState('low');
  const [dueDate, setDueDate] = useState('');
  const [darkMode, setDarkMode] = useState(true);

  const theme = {
    bg: darkMode ? '#030711' : '#F9FAFB',
    card: darkMode ? '#111827' : '#FFFFFF',
    text: darkMode ? '#FFFFFF' : '#1F2937',
    subText: darkMode ? '#9CA3AF' : '#6B7280',
    border: darkMode ? '#374151' : '#E5E7EB',
  };

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
    await supabase.from('tasks').insert([{ title: newTask, user_id: session.user.id, status: 'To Do', priority, due_date: dueDate }]);
    setNewTask('');
    setDueDate('');
    fetchTasks();
  };

  const moveTask = async (id: number, currentStatus: string, direction: 'left' | 'right') => {
    const statuses = ['To Do', 'In Progress', 'Done'];
    const currentIndex = statuses.indexOf(currentStatus);
    const nextIndex = direction === 'right' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex >= 0 && nextIndex < statuses.length) {
      const newStatus = statuses[nextIndex];
      await supabase.from('tasks').update({ status: newStatus }).eq('id', id);
      fetchTasks();
    }
  };

  // دالة الإحصائيات (الميزة الجديدة)
  const getTaskCount = (status: string) => tasks.filter(t => t.status === status).length;

  if (!session) return <div style={{ background: theme.bg, color: theme.text, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>يرجى تسجيل الدخول...</div>;

  return (
    <div style={{ background: theme.bg, color: theme.text, minHeight: '100vh', padding: '24px', transition: '0.3s' }}>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layout color="#3B82F6" /> DevFlow Studio
        </h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setDarkMode(!darkMode)} style={{ padding: '8px 16px', background: theme.card, border: `1px solid ${theme.border}`, borderRadius: '8px', cursor: 'pointer', color: theme.text }}>
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button onClick={() => supabase.auth.signOut()} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#EF4444' }}><LogOut /></button>
        </div>
      </header>

      <div style={{ background: theme.card, padding: '16px', borderRadius: '12px', border: `1px solid ${theme.border}`, display: 'flex', gap: '10px', marginBottom: '32px' }}>
        <input style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: theme.text }} value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="أضف مهمة..." />
        <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: '6px' }}>
          <option value="low">عادي</option>
          <option value="medium">متوسط</option>
          <option value="high">هام</option>
        </select>
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={{ background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: '6px' }} />
        <button onClick={addTask} style={{ background: '#2563EB', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}><Plus /></button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {['To Do', 'In Progress', 'Done'].map((status) => (
          <div key={status} style={{ background: theme.card, padding: '16px', borderRadius: '12px', border: `1px solid ${theme.border}` }}>
            <h2 style={{ color: theme.subText, marginBottom: '16px', fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
              {status}
              <span style={{ background: theme.border, padding: '2px 8px', borderRadius: '10px', fontSize: '10px' }}>{getTaskCount(status)}</span>
            </h2>
            <AnimatePresence>
              {tasks.filter(t => t.status === status).map((task) => (
                <motion.div key={task.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ background: darkMode ? '#1F2937' : '#F3F4F6', padding: '12px', borderRadius: '8px', marginBottom: '8px', borderLeft: `4px solid ${task.priority === 'high' ? '#EF4444' : '#22C55E'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {task.priority === 'high' && <AlertCircle size={14} color="#EF4444" />}
                        <p style={{ fontWeight: '500', margin: 0 }}>{task.title}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {status !== 'To Do' && <button onClick={() => moveTask(task.id, status, 'left')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: theme.text }}><ChevronLeft size={16} /></button>}
                      {status !== 'Done' && <button onClick={() => moveTask(task.id, status, 'right')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: theme.text }}><ChevronRight size={16} /></button>}
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: theme.subText, marginTop: '8px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><Calendar size={10} /> {task.due_date || 'بدون تاريخ'}</span>
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