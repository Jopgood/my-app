import { Share2, Info } from 'lucide-react';
import NBTReader from './nbt-reader';

export function Header() {
  return (
    <header className="bg-gray-900 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold">MineCraft Viewer</h1>
        </div>
        <nav className="flex space-x-4">
          <NBTReader />
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
            <Share2 size={20} />
            <span>Share</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
            <Info size={20} />
            <span>Help</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
