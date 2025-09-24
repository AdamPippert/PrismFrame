import React, { useState } from "react";
import Terminal from "./Terminal";

interface TerminalTab {
  id: string;
  title: string;
}

const TerminalTabs: React.FC = () => {
  const [tabs, setTabs] = useState<TerminalTab[]>([
    { id: "1", title: "Terminal 1" }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>("1");

  const createNewTab = () => {
    const newId = Date.now().toString();
    const newTab: TerminalTab = {
      id: newId,
      title: `Terminal ${tabs.length + 1}`
    };

    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newId);
  };

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) return; // Don't close the last tab

    setTabs(prev => prev.filter(tab => tab.id !== tabId));

    if (activeTabId === tabId) {
      const remainingTabs = tabs.filter(tab => tab.id !== tabId);
      setActiveTabId(remainingTabs[0]?.id || "");
    }
  };

  const updateTabTitle = (tabId: string, newTitle: string) => {
    setTabs(prev => prev.map(tab =>
      tab.id === tabId ? { ...tab, title: newTitle } : tab
    ));
  };

  return (
    <div className="terminal-tabs-container">
      <div className="tab-bar">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`tab ${activeTabId === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTabId(tab.id)}
          >
            <span className="tab-title">{tab.title}</span>
            {tabs.length > 1 && (
              <button
                className="tab-close"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                title="Close tab"
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button
          className="new-tab-btn"
          onClick={createNewTab}
          title="New tab"
        >
          +
        </button>
      </div>

      <div className="terminal-content">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`terminal-wrapper ${activeTabId === tab.id ? 'active' : ''}`}
          >
            <Terminal
              id={tab.id}
              isActive={activeTabId === tab.id}
              onTitleChange={updateTabTitle}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TerminalTabs;