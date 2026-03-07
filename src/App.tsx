import { Header } from './components/layout/Header';
import { ChatPanel } from './components/layout/ChatPanel';
import { GalaxyCanvas } from './components/galaxy/GalaxyCanvas';

function App() {
  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-galaxy-bg">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <GalaxyCanvas />
        <ChatPanel />
      </div>
    </div>
  );
}

export default App;
