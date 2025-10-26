import { Link } from 'react-router';
import {
  Users,
  Settings,
  Activity,
  TrendingUp,
  AlertTriangle,
  GitPullRequest,
  GitMerge,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { adminApi, githubApi, type GitHubIssue } from '@/lib/api';
import { Badge } from '@/components/ui/badge';

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

// Helper function to format relative time
function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

// Helper function to get state badge
function getStateBadge(item: GitHubIssue) {
  const isPR = !!item.pull_request;
  const isClosed = item.state === 'closed';

  if (isPR) {
    return isClosed ? (
      <Badge variant="secondary" className="gap-1">
        <GitMerge className="size-3" />
        Merged
      </Badge>
    ) : (
      <Badge variant="default" className="gap-1">
        <GitPullRequest className="size-3" />
        Open PR
      </Badge>
    );
  }

  return isClosed ? (
    <Badge variant="outline" className="gap-1">
      <CheckCircle2 className="size-3" />
      Closed
    </Badge>
  ) : (
    <Badge variant="default" className="gap-1">
      <Circle className="size-3" />
      Open
    </Badge>
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

  // Fetch GitHub activity
  const { data: githubIssues, isLoading: issuesLoading } = useQuery({
    queryKey: ['github-issues'],
    queryFn: () => githubApi.getRecentIssues(6),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
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
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Recent GitHub Activity</h2>
        <Card>
          <CardContent className="">
            {issuesLoading ? (
              <div className="text-center text-gray-500">Loading GitHub activity...</div>
            ) : githubIssues && githubIssues.length > 0 ? (
              <div className="space-y-4">
                {githubIssues.map((item, index) => (
                  <div
                    key={item.number}
                    className={`flex items-start justify-between ${
                      index < githubIssues.length - 1 ? 'border-b border-gray-100 pb-4' : ''
                    }`}
                  >
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        {getStateBadge(item)}
                        <a
                          href={item.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-gray-900 transition-colors hover:text-blue-600"
                        >
                          #{item.number} {item.title}
                        </a>
                      </div>
                      <p className="text-sm text-gray-600">
                        by @{item.user.login}
                        {item.labels.length > 0 && (
                          <span className="ml-2">
                            {item.labels.slice(0, 3).map((label) => (
                              <span
                                key={label.name}
                                className="ml-1 inline-block rounded-full px-2 py-0.5 text-xs"
                                style={{
                                  backgroundColor: `#${label.color}20`,
                                  color: `#${label.color}`,
                                }}
                              >
                                {label.name}
                              </span>
                            ))}
                          </span>
                        )}
                      </p>
                    </div>
                    <span className="ml-4 text-sm whitespace-nowrap text-gray-500">
                      {getRelativeTime(item.updated_at)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500">No recent activity</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
