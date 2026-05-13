'use server'
import dbConnect from '@/lib/db';
import { Session } from '@/models/Session';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { io } from 'socket.io-client';

// Initialisation du client Socket (côté serveur pour émettre)
const socket = io(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000', {
  path: '/api/socket',
  addTrailingSlash: false,
});

export async function createSession() {
  await dbConnect();
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  await Session.create({ code, active: true, subjects: [] });
  redirect(`/session/${code}/admin`);
}

export async function joinSession(formData: FormData) {
  const code = formData.get('code')?.toString().toUpperCase();
  if (code) redirect(`/session/${code}`);
}

// UNE SEULE FONCTION addSubject (Fusionnée)
export async function addSubject(sessionCode: string, formData: FormData) {
  await dbConnect();
  const question = formData.get('question')?.toString();
  
  // 1. Fermer tous les anciens sujets
  await Session.updateOne(
    { code: sessionCode },
    { $set: { "subjects.$[].isOpen": false } }
  );

  // 2. Ajouter le nouveau sujet ouvert
  await Session.findOneAndUpdate(
    { code: sessionCode },
    { $push: { subjects: { question, isOpen: true, votes: [] } } }
  );

  // 3. SIGNAL WEBSOCKET : Nouvelle question
  socket.emit('new-question', { sessionCode });

  revalidatePath(`/session/${sessionCode}/admin`);
  revalidatePath(`/session/${sessionCode}`);
}

export async function submitVote(sessionCode: string, subjectIndex: number, choice: boolean) {
  console.log("--- VOTE REÇU ---", { sessionCode, subjectIndex, choice }); // Ajoute cette ligne
  await dbConnect();
  // IP & Anonymat
  const headerList = await headers(); 
  const forwarded = headerList.get('x-forwarded-for');
  const ip = typeof forwarded === 'string' ? forwarded.split(',')[0] : '127.0.0.1';
  const voterHash = crypto.createHash('sha256').update(ip + sessionCode).digest('hex');

  const alreadyVoted = await Session.findOne({
    code: sessionCode,
    [`subjects.${subjectIndex}.votes.voterHash`]: voterHash
  });

  if (!alreadyVoted) {
    await Session.findOneAndUpdate(
      { code: sessionCode },
      { $push: { [`subjects.${subjectIndex}.votes`]: { voterHash, choice } } }
    );
    
    // SIGNAL WEBSOCKET : Nouveau vote pour l'admin
    socket.emit('new-vote', { sessionCode });

    revalidatePath(`/session/${sessionCode}`);
    revalidatePath(`/session/${sessionCode}/admin`);
  }
}