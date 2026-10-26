import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from './api.js';

const ContentContext = createContext(null);

function readInitial() {
  try {
    const el = document.getElementById('initial-data');
    return el ? JSON.parse(el.textContent) : null;
  } catch {
    return null;
  }
}

export function ContentProvider({ children }) {
  const [state, setState] = useState(() => readInitial());
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      setState(await api.content());
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    if (!state) refresh();
  }, [state, refresh]);

  const patch = useCallback((section, data) => {
    setState((s) => (s ? { ...s, content: { ...s.content, [section]: data } } : s));
  }, []);

  return (
    <ContentContext.Provider value={{ content: state?.content || null, updatedAt: state?.updatedAt, error, refresh, patch }}>
      {children}
    </ContentContext.Provider>
  );
}

export const useContent = () => useContext(ContentContext);
