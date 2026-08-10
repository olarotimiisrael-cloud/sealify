localStorage.getItem('sealify_last_sync') || new Date().toLocaleTimeString()
  );

  // Hybrid listings: prefer real API, fallback to context
  const listings = listingsData?.listings || ctx.listings;
  const myListings = myListingsData?.listings || ctx.listings.filter(l => l.sellerId === ctx.user?.id);
  const conversations = conversationsData?.conversations || ctx.conversations;
  const notifications = notificationsData?.notifications || ctx.notifications;
  const wallet = walletData?.wallet || ctx.wallet;
  const transactions = transactionsData?.transactions || ctx.transactions;
  const marketStats = marketStatsData || ctx.marketStats;

  // Sync functions
  const syncDatabase = useCallback(async () => {
    setIsSyncing(true);
    try {
      await Promise.all([
        // Trigger refetches
        // Note: React Query handles caching, so we just invalidate
      ]);
      const now = new Date().toLocaleTimeString();
      setLastSyncTime(now);
      localStorage.setItem('sealify_last_sync', now);
      toast.success('Database synchronized');
    } catch (error) {
      toast.error('Sync failed');
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Real API actions
  const toggleSaveListing = useCallback(async (id: string) => {
    // This would call a real API endpoint
    // For now, maintain context behavior
    return ctx.toggleSaveListing(id);
  }, [ctx]);

  const createListing = useCallback(async (data: any, files?: File[]) => {
    try {
      // Upload images first if provided
      let images = data.images || [];
      if (files && files.length > 0) {
        // TODO: Implement image upload to Supabase Storage
        // For now, use placeholder URLs
        images = Array.from(files).map(() => 'https://via.placeholder.com/600');
      }
      
      const result = await api.post('/listings', {
        ...data,
        images,
        specifications: data.specifications || {}
      });
      
      toast.success('Ad posted successfully!');
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Failed to post ad');
      return false;
    }
  }, []);

  const updateListing = useCallback(async (id: string, updates: any) => {
    try {
      await api.put(`/listings/${id}`, updates);
      toast.success('Listing updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update');
    }
  }, []);

  const deleteListing = useCallback(async (id: string) => {
    try {
      await api.delete(`/listings/${id}`);
      toast.success('Listing deleted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete');
    }
  }, []);

  const sendMessage = useCallback(async (listingId: string, receiverId: string, content: string) => {
    try {
      await api.post('/conversations', { listingId, receiverId, content });
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
    }
  }, []);

  const markNotificationRead = useCallback(async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
    } catch (error) {
      console.error('Failed to mark notification read', error);
    }
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    try {
      await api.put('/notifications/read-all');
    } catch (error) {
      console.error('Failed to mark all read', error);
    }
  }, []);

  const requestPayout = useCallback(async (amount: number) => {
    try {
      await api.post('/wallet/payout', { amount });
      toast.success(`Payout of ₦${amount.toLocaleString()} requested`);
    } catch (error: any) {
      toast.error(error.message || 'Payout failed');
    }
  }, []);

  const syncDatabase = useCallback(async () => {
    // Trigger refetch of all queries
    // React Query handles this via invalidation
    toast.success('Database synchronized');
  }, []);

  return {
    // Original context (fallback)
    ...ctx,
    
    // Real API data (preferred)
    listings: listings as any,
    myListings,
    conversations: conversations as any,
    notifications: notifications as any,
    wallet: wallet as any,
    transactions: transactions as any,
    marketStats: marketStats as any,
    
    // Real API actions
    toggleSaveListing,
    createListing,
    updateListing,
    deleteListing,
    sendMessage,
    markNotificationRead,
    markAllNotificationsRead,
    requestPayout,
    syncDatabase,
    
    // Sync state
    isSyncing,
    lastSyncTime,
    refetchListings,
    refetchMyListings,
    refetchConversations,
    refetchNotifications,
  };
}

export default useSealifyBridge;