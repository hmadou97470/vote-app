import { createSession, joinSession } from './actions';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="p-8 bg-white shadow-xl rounded-2xl w-full max-w-md border border-gray-100">
        <h1 className="text-3xl font-black mb-8 text-center text-gray-800">VOTE.io</h1>
        <form action={createSession}>
          <button className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">
            Créer une Session
          </button>
        </form>
        <div className="my-8 border-t relative text-center">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-4 text-gray-400 text-sm">OU REJOINDRE</span>
        </div>
        <form action={joinSession} className="space-y-3">
          <input name="code" placeholder="CODE (ex: BZWD20)" className="w-full p-4 border rounded-xl text-center font-mono text-xl uppercase outline-none focus:ring-2 focus:ring-indigo-500" required />
          <button className="w-full bg-emerald-500 text-white p-4 rounded-xl font-bold hover:bg-emerald-600 transition shadow-lg shadow-emerald-100">
            Rejoindre le Vote
          </button>
        </form>
      </div>
    </main>
  );
}