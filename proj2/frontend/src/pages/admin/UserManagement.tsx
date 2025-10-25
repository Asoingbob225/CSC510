import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function UserManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="mt-2 text-gray-600">Manage user accounts and permissions.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Users className="size-6 text-blue-600" />
            <div>
              <CardTitle>User List</CardTitle>
              <CardDescription>View and manage all registered users</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
            <Users className="mx-auto size-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Coming Soon</h3>
            <p className="mt-2 text-sm text-gray-600">
              User management features will be available here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
