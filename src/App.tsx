import { useState, useCallback, useRef, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { ChatPanel } from './components/layout/ChatPanel';
import { GalaxyCanvas } from './components/galaxy/GalaxyCanvas';
import { CustomCursor } from './components/ui/CustomCursor';
import { Footer } from './components/layout/Footer';

function App() {
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  const togglePanel = useCallback(() => {
    console.log('togglePanel clicked, current state:', isPanelCollapsed);
    setIsPanelCollapsed(prev => {
      console.log('Setting isPanelCollapsed to:', !prev);
      return !prev;
    });
  }, [isPanelCollapsed]);

  return (
    <div className="flex flex-col h-screen w-full bg-[#0B0F19] text-slate-50 overflow-hidden font-sans selection:bg-indigo-500/30">
      <CustomCursor />
      <Header onTogglePanel={togglePanel} isPanelCollapsed={isPanelCollapsed} />
      <main className="flex flex-1 overflow-hidden relative">
        <GalaxyCanvas />
        <div
          className={`transition-all duration-300 ease-in-out ${
            isPanelCollapsed ? 'translate-x-full opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'
          }`}
        >
          <ChatPanel width={400} />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;
