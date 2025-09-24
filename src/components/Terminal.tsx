import React, { useEffect, useRef, useState } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebglAddon } from "@xterm/addon-webgl";
import { invoke } from "@tauri-apps/api/tauri";
import "@xterm/xterm/css/xterm.css";
import { useTheme } from "../contexts/ThemeContext";

interface TerminalProps {
  id: string;
  isActive: boolean;
  onTitleChange?: (id: string, title: string) => void;
}

const Terminal: React.FC<TerminalProps> = ({ id, isActive, onTitleChange }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const ptyIdRef = useRef<number | null>(null);
  const { themeConfig } = useTheme();
  const [, setIsConnected] = useState(false);

  // Focus terminal when it becomes active
  useEffect(() => {
    if (isActive && xtermRef.current) {
      xtermRef.current.focus();
    }
  }, [isActive]);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new XTerm({
      fontFamily: themeConfig?.fonts?.main || "'Fira Code', monospace",
      fontSize: 14,
      theme: {
        background: themeConfig?.terminal?.background || "#000000",
        foreground: themeConfig?.terminal?.foreground || "#00ff88",
        cursor: themeConfig?.terminal?.cursor || "#00ff88",
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    try {
      const webglAddon = new WebglAddon();
      term.loadAddon(webglAddon);
    } catch (e) {
      console.warn("WebGL addon failed to load, using canvas renderer");
    }

    term.open(terminalRef.current);
    fitAddon.fit();

    // Spawn PTY process
    const spawnPty = async () => {
      try {
        console.log("Spawning terminal...");
        
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Terminal spawn timeout")), 10000)
        );
        
        const spawnPromise = invoke("spawn_terminal", {
          shell: "",
          cwd: "",
        });
        
        const ptyId = await Promise.race([spawnPromise, timeoutPromise]) as number;

        console.log("Terminal spawned with ID:", ptyId);
        ptyIdRef.current = ptyId;
        setIsConnected(true);

        term.writeln("Welcome to PrismFrame");
        term.writeln(`Terminal ${id} connected successfully!`);
        term.writeln("");

        // Start reading PTY output
        const readOutput = async () => {
          if (ptyIdRef.current) {
            try {
              const output = await invoke("read_pty_output", { id: ptyIdRef.current }) as string;
              if (output) {
                term.write(output);
              }
            } catch (error) {
              console.error("Failed to read PTY output:", error);
            }
          }
        };

        // Read output periodically
        const outputInterval = setInterval(readOutput, 100);

        // Handle terminal input
        term.onData(async (data) => {
          if (ptyIdRef.current) {
            try {
              await invoke("write_pty_input", {
                id: ptyIdRef.current,
                input: data
              });
            } catch (error) {
              console.error("Failed to write to PTY:", error);
              term.writeln(`\r\nError: ${error}`);
            }
          }
        });

        // Set initial title
        if (onTitleChange) {
          onTitleChange(id, `Terminal ${id}`);
        }

        // Store cleanup function
        (term as any)._outputInterval = outputInterval;
        (term as any)._ptyId = ptyIdRef.current;

      } catch (error) {
        console.error("Failed to spawn PTY:", error);
        term.writeln(`Failed to connect to terminal: ${error}`);
        term.writeln("Please check your setup.");
        setIsConnected(false);
      }
    };

    spawnPty();
    xtermRef.current = term;

    const handleResize = () => {
      fitAddon.fit();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if ((term as any)._outputInterval) {
        clearInterval((term as any)._outputInterval);
      }

      // Kill PTY process if it exists
      if (ptyIdRef.current) {
        invoke("kill_terminal", { id: ptyIdRef.current }).catch(console.error);
      }

      term.dispose();
    };
  }, [themeConfig]);

  return (
    <div className="terminal-container">
      <div className="panel-title">Terminal</div>
      <div ref={terminalRef} className="terminal" />
    </div>
  );
};

export default Terminal;