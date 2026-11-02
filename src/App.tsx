import { PenTool } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-chinese-paper text-chinese-ink flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-chinese-red text-white flex items-center justify-center font-bold text-xl shadow">
            漢
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">HanWri</h1>
            <p className="text-xs text-gray-500">Luyện viết & Học chữ Hán thông minh</p>
          </div>
        </div>
      </header>
      <main className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center">
          <PenTool className="w-12 h-12 mx-auto text-chinese-red mb-3" />
          <p className="text-lg font-medium">Chào mừng đến với HanWri</p>
        </div>
      </main>
    </div>
  );
}
