import { Link } from 'react-router';
import { Users, Settings, Activity, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend?: string;
}

function StatCard({ title, value, description, icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div className="mt-2 flex items-center text-xs text-green-600">
            <TrendingUp className="mr-1 size-3" />
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface QuickLinkProps {
  title: string;
  description: string;
  link: string;
  icon: React.ReactNode;
}

function QuickLink({ title, description, link, icon }: QuickLinkProps) {
  return (
    <Link
      to={link}
      className="block rounded-lg border border-gray-200 bg-white p-6 transition-all hover:border-blue-300 hover:shadow-md"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-full bg-blue-50 p-3 text-blue-600">{icon}</div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </Link>
  );
}

export default function AdminDashboard() {
  // Fetch allergens data for statistics
  const { data: allergens } = useQuery({
    queryKey: ['allergens'],
    queryFn: adminApi.getAllergens,
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: adminApi.getAllUsers,
  });

  // Calculate allergen statistics
  const totalAllergens = allergens?.length ?? 0;
  const majorAllergens = allergens?.filter((a) => a.is_major_allergen).length ?? 0;
  const allergenCategories = new Set(allergens?.map((a) => a.category)).size;

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome to Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Manage your Eatsential platform from this central control panel.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={user ? user.length.toString() : '0'}
          description="Active registered users"
          icon={<Users className="size-4" />}
          trend="+12% from last month"
        />
        <StatCard
          title="Total Allergens"
          value={totalAllergens.toString()}
          description="In allergen database"
          icon={<AlertTriangle className="size-4" />}
        />
        <StatCard
          title="Major Allergens"
          value={majorAllergens.toString()}
          description="FDA major allergens tracked"
          icon={<AlertTriangle className="size-4" />}
        />
        <StatCard
          title="Allergen Categories"
          value={allergenCategories.toString()}
          description="Distinct allergen categories"
          icon={<Activity className="size-4" />}
        />
      </div>

      {/* Quick links section */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <QuickLink
            title="User Management"
            description="View, edit, and manage user accounts and permissions"
            link="/system-manage/users"
            icon={<Users className="size-6" />}
          />
          <QuickLink
            title="Allergen Management"
            description="Manage the central allergen database for health profiles"
            link="/system-manage/allergens"
            icon={<AlertTriangle className="size-6" />}
          />
          <QuickLink
            title="System Settings"
            description="Configure system-wide settings and preferences"
            link="/system-manage/settings"
            icon={<Settings className="size-6" />}
          />
          <QuickLink
            title="Activity Logs"
            description="Monitor system activities and user actions"
            link="/system-manage/logs"
            icon={<Activity className="size-6" />}
          />
        </div>
      </div>

      {/* Recent activity section */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Recent Activity</h2>
        <Card>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <p className="font-medium text-gray-900">Allergen database updated</p>
                  <p className="text-sm text-gray-600">
                    {totalAllergens} allergens now available in the system
                  </p>
                </div>
                <span className="text-sm text-gray-500">Just now</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <p className="font-medium text-gray-900">Major allergens configured</p>
                  <p className="text-sm text-gray-600">
                    {majorAllergens} FDA major allergens tracked
                  </p>
                </div>
                <span className="text-sm text-gray-500">5 minutes ago</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Allergen categories organized</p>
                  <p className="text-sm text-gray-600">
                    {allergenCategories} distinct categories available
                  </p>
                </div>
                <span className="text-sm text-gray-500">10 minutes ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
