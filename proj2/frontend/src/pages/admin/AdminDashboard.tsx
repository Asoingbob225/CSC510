import { Link } from 'react-router';
import { Users, Settings, Activity, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
          value="1,234"
          description="Active registered users"
          icon={<Users className="size-4" />}
          trend="+12% from last month"
        />
        <StatCard
          title="Health Profiles"
          value="987"
          description="Completed health profiles"
          icon={<Activity className="size-4" />}
          trend="+8% from last month"
        />
        <StatCard
          title="Active Sessions"
          value="156"
          description="Currently logged in"
          icon={<TrendingUp className="size-4" />}
        />
        <StatCard
          title="System Status"
          value="Healthy"
          description="All services operational"
          icon={<Settings className="size-4" />}
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
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <p className="font-medium text-gray-900">New user registration</p>
                  <p className="text-sm text-gray-600">user@example.com registered</p>
                </div>
                <span className="text-sm text-gray-500">2 minutes ago</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <p className="font-medium text-gray-900">Health profile created</p>
                  <p className="text-sm text-gray-600">User completed health wizard</p>
                </div>
                <span className="text-sm text-gray-500">15 minutes ago</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">System update</p>
                  <p className="text-sm text-gray-600">Backend services updated to v1.2.0</p>
                </div>
                <span className="text-sm text-gray-500">1 hour ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
