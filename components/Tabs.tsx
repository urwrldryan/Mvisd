import React from 'react';
import { Tab } from '../types';

interface TabsProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
  const tabs: { id: Tab; label: string }[] = [
    { id: 'main', label: 'Main' },
    { id: 'community', label: 'Community' },
    { id: 'admin', label: 'Admin' },
  ];

  return (
    <nav className="flex border-b border-gray-700">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-6 py-4 font-semibold text-sm sm:text-base transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 rounded-t-lg
            ${
              activeTab === tab.id
                ? 'border-b-2 border-indigo-500 text-indigo-400'
                : 'text-slate-400 hover:text-indigo-400 hover:bg-gray-700/50'
            }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
};

export default Tabs;