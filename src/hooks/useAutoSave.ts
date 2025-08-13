import { useEffect, useState, useCallback } from "react";

export function useAutoSave(data: any, delay = 10000) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle"|"saving"|"saved"|"error">("idle");

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        if (Object.keys(data || {}).some((k) => (data as any)[k])) {
          setSaveStatus("saving");
          const backup = { data, timestamp: new Date().toISOString() };
          sessionStorage.setItem("tg_form_backup", JSON.stringify(backup));
          setLastSaved(new Date());
          setSaveStatus("saved");
        }
      } catch {
        setSaveStatus("error");
      }
    }, delay);
    return () => clearTimeout(t);
  }, [data, delay]);

  const loadBackup = useCallback(() => {
    try {
      const raw = sessionStorage.getItem("tg_form_backup");
      if (!raw) return null;
      return JSON.parse(raw).data;
    } catch { return null; }
  }, []);

  const clearBackup = useCallback(() => sessionStorage.removeItem("tg_form_backup"), []);

  return { lastSaved, saveStatus, loadBackup, clearBackup };
}
