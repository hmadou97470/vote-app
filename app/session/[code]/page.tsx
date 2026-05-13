'use client'

import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { submitVote } from '@/app/actions';

export default function ParticipantPage({ params }: { params: Promise<{ code: string }> }) {
  // Correction Next.js 15 : On déballe params avec React.use()
  const resolvedParams = React.use(params);
  const code = resolvedParams.code;

  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/socket');
    const socket = io({ path: '/api/socket' });

    const fetchData = async () => {
      try {
        const res = await fetch(`/session/${code}/api`);
        if (!res.ok) throw new Error("Erreur réseau");
        const data = await res.json();
        setSessionData(data);
      } catch (err) {
        console.error("Erreur fetchData:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    socket.on('update-view', () => {
      fetchData();
    });

    return () => {
      socket.disconnect();
    };
  }, [code]);

  const activeSubjectIndex = sessionData?.subjects?.findIndex((s: any) => s.isOpen);
  const activeSubject = (activeSubjectIndex !== undefined && activeSubjectIndex !== -1) 
    ? sessionData.subjects[activeSubjectIndex] 
    : null;

  if (loading) return <div className="p-10 text-center font-mono">Connexion à la session...</div>;

  return (
    <div className="p-6 max-w-md mx-auto text-center min-h-screen flex flex-col justify-center">
      <h1 className="text-gray-400 mb-10 font-mono text-sm uppercase tracking-widest">
        SESSION ACTIVE : {code}
      </h1>
      
      {!activeSubject ? (
        <div className="p-10 bg-white rounded-3xl shadow-xl border-2 border-dashed border-gray-100">
          <p className="text-xl font-medium text-gray-500 italic">En attente d'un sujet... ⏳</p>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-gray-50">
          <h2 className="text-2xl font-black mb-10 text-gray-800 leading-tight">
            {activeSubject.question}
          </h2>

          <div className="grid gap-4">
            <form action={submitVote.bind(null, code, activeSubjectIndex, true)}>
              <button type="submit" className="w-full bg-emerald-500 text-white py-5 rounded-2xl text-xl font-bold active:scale-95 transition-transform shadow-lg shadow-emerald-100">
                OUI ✅
              </button>
            </form>

            <form action={submitVote.bind(null, code, activeSubjectIndex, false)}>
              <button type="submit" className="w-full bg-rose-500 text-white py-5 rounded-2xl text-xl font-bold active:scale-95 transition-transform shadow-lg shadow-rose-100">
                NON ❌
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}