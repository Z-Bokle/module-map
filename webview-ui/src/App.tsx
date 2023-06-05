import { vscode } from "./utilities/vscode";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import "./App.css";
import { useCallback, useEffect, useState } from "react";
import { ESModule } from '../../src/classes/ESModule';

function App() {

  const [modules, setModules] = useState<ESModule[]>([])

  useEffect(() => {
    window.addEventListener('message', handleReceiveMessage)
    return () => window.removeEventListener('message', handleReceiveMessage)
  }, [])

  const handleReceiveMessage = useCallback((event) => {
    const { command, data } = event.data

    switch (command) {
      case 'addESModule':
        setModules((modules) => [...modules, data])
        break;
      default:
        break;
    }

    }, [])

  const handleReAnalyse = () => {
    setModules([])
    vscode.postMessage({
      command: 'analyse'
    })
  }

  return (
    <main>
      <h1>Hello World!</h1>
      <VSCodeButton onClick={handleReAnalyse}>Analyse</VSCodeButton>
      <div>
        {modules.map((module) => module.path)}
      </div>
    </main>
  );
}

export default App;
