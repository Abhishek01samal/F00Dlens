import { useState, useEffect, useCallback } from 'react';

export interface HistoryItem {
  id: string;
  mode: 'comparison' | 'info' | 'food' | 'diet' | 'product';
  title: string;
  description: string;
  timestamp: number;
  data: any;
}

const HISTORY_KEY = 'foodie-analysis-history';
const MAX_HISTORY = 50;

export const useHistoryStore = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(parsed);
        setHasInteracted(parsed.length > 0);
      }
      
      // Check interaction flag
      const interacted = localStorage.getItem('user-has-interacted');
      if (interacted === 'true') {
        setHasInteracted(true);
      }
    } catch (e) {
      console.error('Error loading history:', e);
    }
  }, []);

  // Save history to localStorage
  const saveHistory = useCallback((items: HistoryItem[]) => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, MAX_HISTORY)));
    } catch (e) {
      console.error('Error saving history:', e);
    }
  }, []);

  // Add item to history
  const addToHistory = useCallback((item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    
    setHistory(prev => {
      const updated = [newItem, ...prev].slice(0, MAX_HISTORY);
      saveHistory(updated);
      return updated;
    });
    
    // Mark that user has interacted
    setHasInteracted(true);
    localStorage.setItem('user-has-interacted', 'true');
  }, [saveHistory]);

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([]);
    setHasInteracted(false);
    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem('user-has-interacted');
  }, []);

  // Remove single item
  const removeFromHistory = useCallback((id: string) => {
    setHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      saveHistory(updated);
      if (updated.length === 0) {
        setHasInteracted(false);
        localStorage.removeItem('user-has-interacted');
      }
      return updated;
    });
  }, [saveHistory]);

  // Mark as interacted (for cursor control)
  const markInteracted = useCallback(() => {
    setHasInteracted(true);
    localStorage.setItem('user-has-interacted', 'true');
  }, []);

  return {
    history,
    hasInteracted,
    addToHistory,
    clearHistory,
    removeFromHistory,
    markInteracted,
  };
};
