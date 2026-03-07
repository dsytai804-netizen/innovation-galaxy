import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ChatPanel } from './components/layout/ChatPanel';
import { GalaxyCanvas } from './components/galaxy/GalaxyCanvas';
import { CustomCursor } from './components/ui/CustomCursor';

function App() {
  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-galaxy-bg relative">
      <CustomCursor />
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <GalaxyCanvas />
        <ChatPanel />
      </div>
      <Footer />
    </div>
  );
}

export default App;
