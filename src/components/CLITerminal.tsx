import React, { useState, useRef, useEffect, useCallback } from "react";
import { X, Minus, Maximize2 } from "lucide-react";
import { parseCommand, resetConfigMode } from "@/simulation/cliParser";
import { useSimulation } from "@/simulation/simulationContext";
import { incrementCliCommands } from "@/simulation/progressStore";

interface CLITerminalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CLITerminal({ isOpen, onClose }: CLITerminalProps) {
  const { state, addCliCommand } = useSimulation();
  const [lines, setLines] = useState<Array<{ type: "input" | "output"; text: string }>>([
    { type: "output", text: `\nFortiGate-5001E (${state.systemInfo.hostname}) ${state.systemInfo.firmware}\n\nType '?' for help.\n` },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [isMaximized, setIsMaximized] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [lines]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;

    setLines(prev => [...prev, { type: "input", text: `${state.systemInfo.hostname} # ${cmd}` }]);
    setHistory(prev => [...prev, cmd]);
    setHistoryIdx(-1);
    setInput("");

    addCliCommand(cmd);
    incrementCliCommands();

    const cliCtx = {
      systemInfo: state.systemInfo as unknown as Record<string, string>,
      cpuUsage: state.cpuUsage,
      memoryUsage: state.memoryUsage,
      interfaces: state.interfaces,
      routes: state.routes,
      policies: state.policies,
      ipsecTunnels: state.ipsecTunnels,
      dhcpLeases: state.dhcpLeases,
      currentSessions: state.currentSessions,
      alertLogs: state.alertLogs,
      fortiviewSessions: state.fortiviewSessions,
    };

    const result = parseCommand(cmd, cliCtx);
    if (result.output) {
      setLines(prev => [...prev, { type: "output", text: result.output }]);
    }
  }, [input, state, addCliCommand]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const idx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
        setHistoryIdx(idx);
        setInput(history[idx]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx >= 0) {
        const idx = historyIdx + 1;
        if (idx >= history.length) {
          setHistoryIdx(-1);
          setInput("");
        } else {
          setHistoryIdx(idx);
          setInput(history[idx]);
        }
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      // Basic autocomplete
      const cmds = ["get", "show", "config", "execute", "diagnose", "exit"];
      const match = cmds.find(c => c.startsWith(input.toLowerCase()));
      if (match) setInput(match + " ");
    }
  }, [history, historyIdx, input]);

  if (!isOpen) return null;

  return (
    <div className={`fixed z-50 bg-[#0a0a0a] border border-border rounded-lg shadow-2xl flex flex-col ${isMaximized ? "inset-2" : "bottom-4 right-4 w-[700px] h-[420px]"}`}>
      {/* Title bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#1a1a1a] rounded-t-lg border-b border-border select-none">
        <div className="flex items-center gap-2">
          <span className="text-[#00ff00] text-xs font-mono">FortiOS CLI</span>
          <span className="text-muted-foreground text-[10px] font-mono">{state.systemInfo.hostname}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsMaximized(!isMaximized)} className="p-1 hover:bg-accent rounded">
            {isMaximized ? <Minus className="h-3 w-3 text-muted-foreground" /> : <Maximize2 className="h-3 w-3 text-muted-foreground" />}
          </button>
          <button onClick={() => { onClose(); resetConfigMode(); }} className="p-1 hover:bg-destructive/20 rounded">
            <X className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Terminal content */}
      <div ref={scrollRef} className="flex-1 overflow-auto p-3 font-mono text-xs leading-5" onClick={() => inputRef.current?.focus()}>
        {lines.map((line, i) => (
          <div key={i} className={line.type === "input" ? "text-[#00ff00]" : "text-[#cccccc]"}>
            <pre className="whitespace-pre-wrap m-0">{line.text}</pre>
          </div>
        ))}

        {/* Input line */}
        <form onSubmit={handleSubmit} className="flex items-center text-[#00ff00]">
          <span className="mr-1">{state.systemInfo.hostname} #</span>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none border-none text-[#00ff00] font-mono text-xs caret-[#00ff00]"
            spellCheck={false}
            autoComplete="off"
          />
        </form>
      </div>
    </div>
  );
}
