// Offline detection and queue management
type QueuedAction = {
  id: string;
  type: string;
  payload: any;
  timestamp: string;
  retries: number;
};

const OFFLINE_QUEUE_KEY = 'sealify_offline_queue';
const MAX_RETRIES = 3;

export const isOnline = (): boolean => navigator.onLine;

export const addToOfflineQueue = (type: string, payload: any): void => {
  const queue = getOfflineQueue();
  queue.push({
    id: crypto.randomUUID(),
    type,
    payload,
    timestamp: new Date().toISOString(),
    retries: 0,
  });
  saveOfflineQueue(queue);
};

export const getOfflineQueue = (): QueuedAction[] => {
  try {
    const stored = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveOfflineQueue = (queue: QueuedAction[]): void => {
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
};

export const processOfflineQueue = async (): Promise<void> => {
  if (!isOnline()) return;

  const queue = getOfflineQueue();
  if (queue.length === 0) return;

  const remaining: QueuedAction[] = [];

  for (const action of queue) {
    try {
      const response = await fetch(`/api/offline/${action.type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action.payload),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      action.retries++;
      if (action.retries < MAX_RETRIES) {
        remaining.push(action);
      } else {
        console.error('Action failed permanently:', action);
        // Could notify user here
      }
    }
  }

  saveOfflineQueue(remaining);
};

// Auto-process when coming online
window.addEventListener('online', processOfflineQueue);

// Process periodically
setInterval(processOfflineQueue, 60000); // Every minute

// Convenience methods for common actions
export const offlineQueue = {
  message: (conversationId: string, content: string) =>
    addToOfflineQueue('message', { conversationId, content }),

  favorite: (listingId: string, action: 'add' | 'remove') =>
    addToOfflineQueue('favorite', { listingId, action }),

  view: (listingId: string) =>
    addToOfflineQueue('view', { listingId }),

  offer: (listingId: string, amount: number, message: string) =>
    addToOfflineQueue('offer', { listingId, amount, message }),
};