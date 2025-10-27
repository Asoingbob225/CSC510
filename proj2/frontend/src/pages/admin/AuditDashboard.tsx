import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, User, AlertTriangle, ChevronDown, ChevronUp, Pen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { adminApi, type AllergenAuditLog, type UserAuditLog } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';

export default function AuditDashboard() {
  const [auditType, setAuditType] = useState<'allergen' | 'user'>('allergen');
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  // Fetch allergen audit logs
  const { data: allergenLogs = [], isLoading: allergenLoading } = useQuery({
    queryKey: ['allergen-audit-logs'],
    queryFn: () => adminApi.getAllergenAuditLogs(undefined, 100),
    enabled: auditType === 'allergen',
  });

  // Fetch all user audit logs
  const { data: userLogs = [], isLoading: userLoading } = useQuery({
    queryKey: ['all-user-audit-logs'],
    queryFn: () => adminApi.getAllUserAuditLogs(100),
    enabled: auditType === 'user',
  });

  const toggleExpanded = (logId: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      create: 'bg-green-100 text-green-800',
      update: 'bg-blue-100 text-blue-800',
      delete: 'bg-red-100 text-red-800',
      bulk_import: 'bg-purple-100 text-purple-800',
      role_change: 'bg-orange-100 text-orange-800',
      status_change: 'bg-yellow-100 text-yellow-800',
      profile_update: 'bg-cyan-100 text-cyan-800',
      email_verify: 'bg-pink-100 text-pink-800',
    };

    return (
      <Badge className={`${colors[action] || 'bg-gray-100 text-gray-800'} capitalize`}>
        {action.replace('_', ' ')}
      </Badge>
    );
  };

  const formatChanges = (changes: string | null) => {
    if (!changes) return null;
    try {
      return JSON.parse(changes);
    } catch {
      return changes;
    }
  };

  const renderAllergenLog = (log: AllergenAuditLog) => {
    const isExpanded = expandedLogs.has(log.id);
    const changes = formatChanges(log.changes);

    return (
      <Card key={log.id} className="mb-3">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <AlertTriangle className="size-4 text-blue-600" />
                <h3 className="font-semibold">{log.allergen_name}</h3>
                {getActionBadge(log.action)}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <User className="size-3" />
                  {log.admin_username}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                </span>
              </div>
              {isExpanded && changes && (
                <div className="mt-3 rounded-md bg-gray-50 p-3">
                  <p className="mb-2 text-xs font-medium text-gray-700">Changes:</p>
                  <pre className="text-xs whitespace-pre-wrap text-gray-600">
                    {JSON.stringify(changes, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            {changes && (
              <Button variant="ghost" size="sm" onClick={() => toggleExpanded(log.id)}>
                {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderUserLog = (log: UserAuditLog) => {
    const isExpanded = expandedLogs.has(log.id);
    const changes = formatChanges(log.changes);

    return (
      <Card key={log.id} className="mb-3">
        <CardContent>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <User className="size-4 text-purple-600" />
                <h3 className="font-semibold">{log.target_username}</h3>
                {getActionBadge(log.action)}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Pen className="size-3" />
                  Modified by: {log.admin_username}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                </span>
              </div>
              {isExpanded && changes && (
                <div className="mt-3 rounded-md bg-gray-50 p-3">
                  <p className="mb-2 text-xs font-medium text-gray-700">Changes:</p>
                  <pre className="text-xs whitespace-pre-wrap text-gray-600">
                    {JSON.stringify(changes, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            {changes && (
              <Button variant="ghost" size="sm" onClick={() => toggleExpanded(log.id)}>
                {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const isLoading = auditType === 'allergen' ? allergenLoading : userLoading;
  const logs = auditType === 'allergen' ? allergenLogs : userLogs;

  return (
    <div className="space-y-6">
      {/* Header with inline filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit History Dashboard</h1>
          <p className="mt-2 text-gray-600">
            View and track all administrative actions for allergens and users.
          </p>
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={auditType}
            onValueChange={(value: 'allergen' | 'user') => setAuditType(value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="allergen">Allergen Logs</SelectItem>
              <SelectItem value="user">User Logs</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Allergen Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allergenLogs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total User Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userLogs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Viewing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle>
            {auditType === 'allergen' ? 'Allergen Audit Logs' : 'User Audit Logs'}
          </CardTitle>
          <CardDescription>
            {auditType === 'allergen'
              ? 'All allergen database modifications by administrators'
              : 'All user account modifications by administrators'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-gray-500">Loading audit logs...</div>
          ) : logs.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No audit logs found</div>
          ) : (
            <div className="space-y-2">
              {auditType === 'allergen'
                ? allergenLogs.map(renderAllergenLog)
                : userLogs.map(renderUserLog)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
