"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { settingsService, SystemSetting } from '@/lib/services/settings-service';

type SettingsContextType = {
  settings: Record<string, string>;
  loading: boolean;
  getSetting: (key: string, defaultValue?: string) => string;
  refreshSettings: () => Promise<void>;
};

const SettingsContext = createContext<SettingsContextType>({
  settings: {},
  loading: true,
  getSetting: () => '',
  refreshSettings: async () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settingsMap, setSettingsMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    setLoading(true);
    const data = await settingsService.getAll();
    if (data) {
      const map: Record<string, string> = {};
      data.forEach(s => {
        map[s.key] = s.value;
      });
      setSettingsMap(map);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const getSetting = (key: string, defaultValue: string = '') => {
    return settingsMap[key] || defaultValue;
  };

  return (
    <SettingsContext.Provider value={{ 
      settings: settingsMap, 
      loading, 
      getSetting,
      refreshSettings: fetchSettings 
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
