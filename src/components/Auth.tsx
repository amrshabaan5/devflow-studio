import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Auth({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await supabase.auth.signUp({ email, password });
        alert('تم التسجيل! يرجى التحقق من البريد أو الدخول مباشرة.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuthSuccess();
      }
    } catch (err: any) { alert(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-[#0f0f1a] p-4">
      <form onSubmit={handleAuth} className="bg-[#16162a] p-8 rounded-2xl border border-gray-800 w-full max-w-sm text-white space-y-4">
        <h2 className="text-2xl font-bold text-center mb-6">{isRegister ? 'إنشاء حساب' : 'تسجيل الدخول'}</h2>
        <input type="email" placeholder="البريد الإلكتروني" className="w-full p-3 rounded-xl bg-[#202038] border border-gray-700" onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="كلمة المرور" className="w-full p-3 rounded-xl bg-[#202038] border border-gray-700" onChange={(e) => setPassword(e.target.value)} />
        <button disabled={loading} className="w-full p-3 bg-blue-600 rounded-xl font-bold">{loading ? '...' : 'دخول'}</button>
        <button type="button" onClick={() => setIsRegister(!isRegister)} className="w-full text-blue-400 text-sm">
          {isRegister ? 'لديك حساب؟ سجل دخولك' : 'ليس لديك حساب؟ سجل الآن'}
        </button>
      </form>
    </div>
  );
}