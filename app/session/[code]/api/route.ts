// app/api/session/[code]/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Session } from '@/models/Session';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  await dbConnect();
  const { code } = await params; // On déballe le Promise ici aussi
  const session = await Session.findOne({ code });
  
  if (!session) {
    return NextResponse.json({ error: 'Session non trouvée' }, { status: 404 });
  }

  return NextResponse.json(session);
}