import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit2, Loader2, Save, ShieldCheck, User as UserIcon, X, AlertCircle } from 'lucide-react';

import { adminApi, type UserListItem } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Alert, AlertTitle } from '@/components/ui/alert';

interface UserDetailsSheetProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated?: () => void;
}

export function UserDetailsSheet({
  userId,
  open,
  onOpenChange,
  onUserUpdated,
}: UserDetailsSheetProps) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    username: '',
    role: '',
    account_status: '',
  });

  // Try to get user details from cache first, then fetch if needed
  const { data: userDetails, isLoading: loading } = useQuery({
    queryKey: ['userDetails', userId],
    queryFn: async () => {
      if (!userId) return null;

      // Fetch detailed info from API
      const details = await adminApi.getUserDetails(userId);

      // Initialize edit form when data is loaded
      setEditForm({
        username: details.username,
        role: details.role,
        account_status: details.account_status,
      });

      return details;
    },
    enabled: !!userId && open,
    staleTime: 1000 * 60, // Consider data fresh for 1 minute
  });

  const handleSave = async () => {
    if (!userId || !userDetails) return;

    setSaving(true);
    setError(null);

    try {
      const updateData: Record<string, string> = {};

      // Only send changed fields
      if (editForm.username !== userDetails.username) {
        updateData.username = editForm.username;
      }
      if (editForm.role !== userDetails.role) {
        updateData.role = editForm.role;
      }
      if (editForm.account_status !== userDetails.account_status) {
        updateData.account_status = editForm.account_status;
      }

      // Only make API call if there are changes
      if (Object.keys(updateData).length > 0) {
        const updatedUser = await adminApi.updateUser(userId, updateData);

        // Update the cache with new user details
        queryClient.setQueryData(['userDetails', userId], updatedUser);

        // Also update the users list cache
        queryClient.setQueryData<UserListItem[]>(['users'], (oldData) => {
          if (!oldData) return oldData;
          return oldData.map((user) =>
            user.id === userId
              ? {
                  ...user,
                  username: updatedUser.username,
                  role: updatedUser.role,
                  account_status: updatedUser.account_status,
                  updated_at: updatedUser.updated_at,
                }
              : user
          );
        });

        setEditForm({
          username: updatedUser.username,
          role: updatedUser.role,
          account_status: updatedUser.account_status,
        });

        // Notify parent component to refresh the user list
        if (onUserUpdated) {
          onUserUpdated();
        }
      }

      setIsEditing(false);
    } catch (error: unknown) {
      console.error('Failed to update user:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { detail?: string } } };
        setError(axiosError.response?.data?.detail || 'Failed to update user. Please try again.');
      } else {
        setError('Failed to update user. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (userDetails) {
      setEditForm({
        username: userDetails.username,
        role: userDetails.role,
        account_status: userDetails.account_status,
      });
    }
    setError(null);
    setIsEditing(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-xl">User Details</SheetTitle>
              <SheetDescription className="mt-1">
                {isEditing ? 'Edit user information' : 'View detailed user information'}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-8 animate-spin text-gray-400" />
          </div>
        ) : userDetails ? (
          <div className="space-y-6 pb-6">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertTitle>{error}</AlertTitle>
              </Alert>
            )}

            {/* User Info Section */}
            <div className="mx-4 space-y-4 rounded-lg border bg-muted/30 p-6">
              <h3 className="text-sm font-semibold text-gray-900">Basic Information</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-xs font-medium text-gray-600">
                    Username
                  </Label>
                  {isEditing ? (
                    <Input
                      id="username"
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      className="h-9"
                      disabled={saving}
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-900">{userDetails.username}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-600">Email</Label>
                  <p className="text-sm text-gray-900">{userDetails.email}</p>
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-600">User ID</Label>
                  <p className="font-mono text-xs text-gray-600">{userDetails.id}</p>
                </div>
              </div>
            </div>

            {/* Status Section */}
            <div className="mx-4 space-y-4 rounded-lg border bg-muted/30 p-6">
              <h3 className="text-sm font-semibold text-gray-900">Account Status</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-xs font-medium text-gray-600">
                    Role
                  </Label>
                  {isEditing ? (
                    <Select
                      value={editForm.role}
                      onValueChange={(value) => setEditForm({ ...editForm, role: value })}
                      disabled={saving}
                    >
                      <SelectTrigger id="role" className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant={userDetails.role === 'admin' ? 'default' : 'secondary'}>
                      {userDetails.role === 'admin' ? (
                        <ShieldCheck className="mr-1 size-3" />
                      ) : (
                        <UserIcon className="mr-1 size-3" />
                      )}
                      {userDetails.role}
                    </Badge>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account_status" className="text-xs font-medium text-gray-600">
                    Account Status
                  </Label>
                  {isEditing ? (
                    <Select
                      value={editForm.account_status}
                      onValueChange={(value) => setEditForm({ ...editForm, account_status: value })}
                      disabled={saving}
                    >
                      <SelectTrigger id="account_status" className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge
                      variant={
                        userDetails.account_status === 'verified'
                          ? 'success'
                          : userDetails.account_status === 'suspended'
                            ? 'destructive'
                            : 'warning'
                      }
                    >
                      {userDetails.account_status}
                    </Badge>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-600">Email Verified</Label>
                  <Badge variant={userDetails.email_verified ? 'success' : 'warning'}>
                    {userDetails.email_verified ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Timestamps Section */}
            <div className="mx-4 space-y-4 rounded-lg border bg-muted/30 p-6">
              <h3 className="text-sm font-semibold text-gray-900">Timeline</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-600">Created At</Label>
                  <p className="text-sm text-gray-900">
                    {new Date(userDetails.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-600">Last Updated</Label>
                  <p className="text-sm text-gray-900">
                    {new Date(userDetails.updated_at).toLocaleString()}
                  </p>
                </div>
                {userDetails.verification_token_expires && (
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-gray-600">
                      Verification Token Expires
                    </Label>
                    <p className="text-sm text-gray-900">
                      {new Date(userDetails.verification_token_expires).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {!loading && userDetails && !isEditing && (
              <div className="flex px-4">
                <Button
                  className="flex-1"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="mr-2 size-4" />
                  Edit
                </Button>
              </div>
            )}

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex flex-col gap-3 px-4">
                <Button onClick={handleSave} className="flex-1" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 size-4" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="flex-1"
                  disabled={saving}
                >
                  <X className="mr-2 size-4" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
