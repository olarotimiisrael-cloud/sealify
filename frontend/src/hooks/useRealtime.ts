import { useEffect, useRef, useState } from 'react';

interface RealtimeOptions {
  table: string;
  filter?: string;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
}

export const useRealtime = ({ table, filter, onInsert, onUpdate, onDelete }: RealtimeOptions) => {
  const channelRef = useRef<any>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    void table;
    void filter;
    void onInsert;
    void onUpdate;
    void onDelete;
    channelRef.current = null;
    setConnected(false);

    return () => {
      channelRef.current = null;
    };
  }, [table, filter, onInsert, onUpdate, onDelete]);

  return { connected };
};
