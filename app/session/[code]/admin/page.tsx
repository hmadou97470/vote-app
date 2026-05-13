import dbConnect from '@/lib/db';
import { Session } from '@/models/Session';
import { addSubject } from '@/app/actions';

// En Next.js 15, params est une Promise
export default async function AdminPage({ params }: { params: Promise<{ code: string }> }) {
  // 1. On déballe params pour obtenir le code
  const { code } = await params;

  // 2. Connexion à la base de données
  await dbConnect();
  
  // 3. Récupération de la session
  const session = await Session.findOne({ code: code });

  // 4. Préparation de l'action avec le code déballé
  const addSubjectWithCode = addSubject.bind(null, code);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">🛠 Administration</h1>
        <p className="text-gray-600">
          Code de session : <span className="font-mono font-bold text-indigo-600">{code}</span>
        </p>
      </header>
      
      <section className="bg-white p-6 rounded-xl shadow-md border mb-10">
        <h3 className="font-semibold text-lg mb-4">Lancer un nouveau débat</h3>
        <form action={addSubjectWithCode} className="space-y-4">
          <input 
            name="question" 
            placeholder="Ex: On valide le budget de 12 000€ ?" 
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            required 
          />
          <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors">
            Ouvrir le vote pour l'équipe
          </button>
        </form>
      </section>
      {session.subjects.map((subject: any, index: number) => {
  // On calcule le score
  const oui = subject.votes.filter((v: any) => v.choice === true).length;
  const non = subject.votes.filter((v: any) => v.choice === false).length;

  return (
    <div key={index} className="bg-white p-4 rounded-lg border shadow-sm flex justify-between items-center">
      <div>
        <p className="font-medium text-lg">{subject.question}</p>
        <div className="flex gap-4 mt-2">
          <span className="text-emerald-600 font-bold">✅ OUI : {oui}</span>
          <span className="text-rose-600 font-bold">❌ NON : {non}</span>
        </div>
      </div>
      {/* ... reste du code (badge EN COURS / CLOS) */}
    </div>
  );
})}
      <section className="space-y-4">
        <h2 className="text-xl font-bold border-b pb-2">Historique des votes</h2>
        
        {!session || !session.subjects || session.subjects.length === 0 ? (
          <p className="text-gray-400 italic">Aucun sujet n'a été lancé pour le moment.</p>
        ) : (
          session.subjects.map((subject: any, index: number) => (
            <div key={index} className="bg-white p-4 rounded-lg border shadow-sm flex justify-between items-center">
              <div>
                <p className="font-medium text-lg">{subject.question}</p>
                <p className="text-sm text-gray-500">
                  Votes enregistrés : {subject.votes?.length || 0}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {subject.isOpen ? (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold animate-pulse">
                    EN COURS
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">
                    CLOS
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}