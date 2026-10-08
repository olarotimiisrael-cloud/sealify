import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

interface SearchFilter {
  category: string | null;
  location: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  [key: string]: any;
}

interface SavedSearch {
  id: string;
  name: string;
  searchQuery: string;
  category: string | null;
  location: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  isActive: boolean;
  emailNotifications: boolean;
  frequency: string;
  lastNotifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const SavedSearchesManager: React.FC = () => {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [editSearchId, setEditSearchId] = useState<string | null>(null);
  const [testEmailStatus, setTestEmailStatus] = useState<{ id: string | null; status: 'idle' | 'loading' | 'success' | 'error' }>({ id: null, status: 'idle' });
  const [searchForm, setSearchForm] = useState({
    name: '',
    searchQuery: {} as SearchFilter,
    category: null as string | null,
    location: null as string | null,
    minPrice: null as number | null,
    maxPrice: null as number | null,
    emailNotifications: true,
    frequency: 'immediate' as const
  });
  const { toast } = useToast();

  // Fetch saved searches for the current user
  const fetchSavedSearches = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/saved-searches', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch saved searches');
      }

      const data = await response.json();
      setSavedSearches(data.searches || []);
    } catch (error) {
      console.error('Error fetching saved searches:', error);
      toast({
        title: 'Error',
        description: 'Failed to load saved searches',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new saved search
  const createSavedSearch = async () => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/saved-searches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: searchForm.name,
          searchQuery: searchForm.searchQuery,
          category: searchForm.category,
          location: searchForm.location,
          minPrice: searchForm.minPrice,
          maxPrice: searchForm.maxPrice,
          emailNotifications: searchForm.emailNotifications,
          frequency: searchForm.frequency,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to create saved search');
      }

      const data = await response.json();
      setSavedSearches(prev => [data.search, ...prev]);
      setSearchForm({
        name: '',
        searchQuery: {} as SearchFilter,
        category: null,
        location: null,
        minPrice: null,
        maxPrice: null,
        emailNotifications: true,
        frequency: 'immediate'
      });
      setEditSearchId(null);

      toast({
        title: 'Success',
        description: 'Saved search created successfully',
      });
    } catch (error) {
      console.error('Error creating saved search:', error);
      toast({
        title: 'Error',
        description: 'Failed to create saved search',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Update an existing saved search
  const updateSavedSearch = async (id: string) => {
    try {
      const response = await fetch('/api/saved-searches', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchId: id,
          name: searchForm.name,
          searchQuery: searchForm.searchQuery,
          category: searchForm.category,
          location: searchForm.location,
          minPrice: searchForm.minPrice,
          maxPrice: searchForm.maxPrice,
          emailNotifications: searchForm.emailNotifications,
          frequency: searchForm.frequency,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to update saved search');
      }

      const data = await response.json();
      setSavedSearches(prev =>
        prev.map(search =>
          search.id === id ? data.search : search
        )
      );
      setEditSearchId(null);

      toast({
        title: 'Success',
        description: 'Saved search updated successfully',
      });
    } catch (error) {
      console.error('Error updating saved search:', error);
      toast({
        title: 'Error',
        description: 'Failed to update saved search',
        variant: 'destructive',
      });
    }
  };

  // Delete a saved search
  const deleteSavedSearch = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this saved search?')) {
      return;
    }

    try {
      const response = await fetch('/api/saved-searches', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchId: id }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete saved search');
      }

      setSavedSearches(prev => prev.filter(search => search.id !== id));

      toast({
        title: 'Success',
        description: 'Saved search deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting saved search:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete saved search',
        variant: 'destructive',
      });
    }
  };

  // Toggle search active status
  const toggleSearchActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/saved-searches', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchId: id,
          isActive: !currentStatus,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to update search status');
      }

      setSavedSearches(prev =>
        prev.map(search =>
          search.id === id ? { ...search, isActive: !currentStatus } : search
        )
      );
    } catch (error) {
      console.error('Error toggling search status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update search status',
        variant: 'destructive',
      });
    }
  };

  // Send test email notification
  const sendTestEmail = async (searchId: string) => {
    setTestEmailStatus(prev => ({ ...prev, id: searchId, status: 'loading' }));
    try {
      const response = await fetch('/api/saved-searches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchId,
          // In a real app, we might allow specifying a test email
          // For now, we'll use the user's email from their profile
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to send test notification');
      }

      const data = await response.json();
      setTestEmailStatus({ id: searchId, status: 'success' });

      toast({
        title: 'Success',
        description: 'Test notification queued for sending',
      });

      // Reset status after 3 seconds
      setTimeout(() => {
        setTestEmailStatus(prev => 
          prev.id === searchId ? { ...prev, status: 'idle' } : prev
        );
      }, 3000);
    } catch (error) {
      console.error('Error sending test email:', error);
      setTestEmailStatus({ id: searchId, status: 'error' });
      
      toast({
        title: 'Error',
        description: 'Failed to send test notification',
        variant: 'destructive',
      });

      // Reset status after 3 seconds
      setTimeout(() => {
        setTestEmailStatus(prev => 
          prev.id === searchId ? { ...prev, status: 'idle' } : prev
        );
      }, 3000);
    }
  };

  // Load saved searches on mount
  useEffect(() => {
    fetchSavedSearches();
  }, []);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setSearchForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <p className="text-muted-foreground">Loading saved searches...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Saved Searches & Alerts</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            onClick={() => setEditSearchId(null)}
            className="w-full sm:w-auto"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg> New Search Alert
          </Button>
        </div>
      </div>

      {/* Search Form */}
      <Card className={`${editSearchId ? 'border-primary' : 'border-muted'}`}>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            {editSearchId ? 'Edit Search Alert' : 'New Search Alert'}
            {editSearchId && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setEditSearchId(null)}
                className="ml-auto p-1"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="search-name">Search Name</Label>
              <Input
                id="search-name"
                placeholder="e.g., 'Lagos Apartments Under 500k'"
                value={searchForm.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="search-frequency">Notification Frequency</Label>
              <SelectTrigger
                id="search-frequency"
                value={searchForm.frequency}
                onValueChange={value => setSearchForm(prev => ({ ...prev, frequency: value }))}
              >
                <SelectValue placeholder="Select frequency" />
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="daily">Daily Digest</SelectItem>
                  <SelectItem value="weekly">Weekly Digest</SelectItem>
                </SelectContent>
              </SelectTrigger>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="search-category">Category</Label>
              <SelectTrigger
                id="search-category"
                value={searchForm.category ?? ''}
                onValueChange={value => setSearchForm(prev => ({ ...prev, category: value === '' ? null : value }))}
              >
                <SelectValue placeholder="Select category (optional)" />
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  <SelectItem value="vehicles">Vehicles</SelectItem>
                  <SelectItem value="real-estate">Real Estate</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="fashion">Fashion</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                  <SelectItem value="jobs">Jobs</SelectItem>
                </SelectContent>
              </SelectTrigger>
            </div>

            <div>
              <Label htmlFor="search-location">Location</Label>
              <Input
                id="search-location"
                placeholder="e.g., 'Lagos', 'Abuja', 'Ogbomoso'"
                value={searchForm.location ?? ''}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="search-min-price">Minimum Price (₦)</Label>
              <Input
                id="search-min-price"
                type="number"
                min="0"
                step="1000"
                placeholder="e.g., 100000"
                value={searchForm.minPrice !== null ? searchForm.minPrice.toString() : ''}
                onChange={e => {
                  const value = e.target.value;
                  setSearchForm(prev => ({
                    ...prev,
                    minPrice: value === '' ? null : parseFloat(value),
                  }));
                }}
              />
            </div>
            
            <div>
              <Label htmlFor="search-max-price">Maximum Price (₦)</Label>
              <Input
                id="search-max-price"
                type="number"
                min="0"
                step="1000"
                placeholder="e.g., 5000000"
                value={searchForm.maxPrice !== null ? searchForm.maxPrice.toString() : ''}
                onChange={e => {
                  const value = e.target.value;
                  setSearchForm(prev => ({
                    ...prev,
                    maxPrice: value === '' ? null : parseFloat(value),
                  }));
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t">
            <Checkbox
              checked={searchForm.emailNotifications}
              onChange={e => setSearchForm(prev => ({ ...prev, emailNotifications: e.target.checked }))}
            />
            <Label htmlFor="email-notifications" className="text-sm flex-1">
              Send email notifications for new matches
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Saved Searches List */}
      {savedSearches.length > 0 ? (
        <>
          <h2 className="text-lg font-semibold mb-4">Your Saved Searches</h2>
          <div className="space-y-4">
            {savedSearches.map(search => (
              <div key={search.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {search.isActive ? (
                      <svg className="h-5 w-5 text-primary-foreground mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3"/>
</svg>
                    ) : (
                      <svg className="h-5 w-5 text-muted-foreground mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3"/>
</svg>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{search.name}</h3>
                      <div className="flex items-center gap-2 text-sm">
                        {search.emailNotifications ? (
                          <span className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3"/>
</svg> Notifications ON
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs bg-muted/10 text-muted px-2 py-0.5 rounded">
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3"/>
</svg> Notifications OFF
                          </span>
                        )}
                        <span className="text-xs">{search.frequency === 'immediate' ? 'Instant' : search.frequency === 'daily' ? 'Daily' : 'Weekly'}</span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <div className="flex flex-wrap gap-2">
                        {search.category && (
                          <span className="bg-muted/20 text-muted px-2 py-0.5 rounded">{search.category}</span>
                        )}
                        {search.location && (
                          <span className="bg-muted/20 text-muted px-2 py-0.5 rounded">
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3"/>
</svg> {search.location}
                          </span>
                        )}
                        {search.minPrice !== null && (
                          <span className="bg-muted/20 text-muted px-2 py-0.5 rounded">
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3"/>
</svg> {search.minPrice.toLocaleString()} +
                          </span>
                        )}
                        {search.maxPrice !== null && (
                          <span className="bg-muted/20 text-muted px-2 py-0.5 rounded">
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3"/>
</svg> Up to {search.maxPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {search.lastNotifiedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Last notified: {new Date(search.lastNotifiedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                
                {editSearchId === search.id ? (
                  <div className="mt-4 pt-3 border-t">
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor={`edit-name-${search.id}`}>Search Name</Label>
                        <Input
                          id={`edit-name-${search.id}`}
                          value={searchForm.name}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <Label htmlFor={`edit-frequency-${search.id}`}>Notification Frequency</Label>
                          <SelectTrigger
                            id={`edit-frequency-${search.id}`}
                            value={searchForm.frequency}
                            onValueChange={value => setSearchForm(prev => ({ ...prev, frequency: value }))}
                          >
                            <SelectValue placeholder="Select frequency" />
                            <SelectContent>
                              <SelectItem value="immediate">Immediate</SelectItem>
                              <SelectItem value="daily">Daily Digest</SelectItem>
                              <SelectItem value="weekly">Weekly Digest</SelectItem>
                            </SelectContent>
                          </SelectTrigger>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={searchForm.emailNotifications}
                            onChange={e => setSearchForm(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                          />
                          <Label htmlFor={`edit-email-notifications-${search.id}`} className="text-sm">
                            Send email notifications
                          </Label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditSearchId(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => updateSavedSearch(search.id)}
                        isLoading={isCreating}
                      >
                        {isCreating ? 'Updating...' : 'Save Changes'}
                      </Button>
                      
                      {/* Test Email Button */}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => sendTestEmail(search.id)}
                        isLoading={testEmailStatus.id === searchId && testEmailStatus.status === 'loading'}
                      >
                        {testEmailStatus.id === searchId && testEmailStatus.status === 'loading' 
                          ? 'Sending...' 
                          : 'Send Test'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 flex justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditSearchId(search.id);
                        setSearchForm({
                          name: search.name,
                          searchQuery: JSON.parse(search.searchQuery || '{}'),
                          category: search.category,
                          location: search.location,
                          minPrice: search.minPrice,
                          maxPrice: search.maxPrice,
                          emailNotifications: search.emailNotifications,
                          frequency: search.frequency,
                        });
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteSavedSearch(search.id)}
                    >
                      Delete
                    </Button>
                    
                    {/* Test Email Button */}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => sendTestEmail(search.id)}
                      isLoading={testEmailStatus.id === searchId && testEmailStatus.status === 'loading'}
                    >
                      {testEmailStatus.id === searchId && testEmailStatus.status === 'loading' 
                        ? 'Sending...' 
                        : 'Send Test'}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 rounded bg-muted/20 text-muted flex items-center justify-center">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </div>
          </div>
          <p className="text-muted-foreground mb-4">
            No saved searches yet. Create your first search alert to get notified
            when new listings match your criteria.
          </p>
          <Button
            variant="outline"
            onClick={() => setEditSearchId(null)}
            className="w-full max-w-xs"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg> Create First Search Alert
          </Button>
        </div>
      )}
    </div>
  );
};

export default SavedSearchesManager;