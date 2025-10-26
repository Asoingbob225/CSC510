import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import {
  ArrowUpDown,
  Eye,
  Loader2,
  Search,
  ShieldCheck,
  User as UserIcon,
  Users,
} from 'lucide-react';

import { adminApi, type UserListItem } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserDetailsSheet } from '@/components/admin/UserDetailsSheet';

export default function UserManagement() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Fetch users using TanStack Query
  const {
    data: users = [],
    isLoading: loading,
    refetch: fetchUsers,
  } = useQuery({
    queryKey: ['users'],
    queryFn: adminApi.getAllUsers,
  });

  // Define table columns
  const columns: ColumnDef<UserListItem>[] = [
    {
      accessorKey: 'username',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-3 h-8"
          >
            Username
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue('username')}</div>,
    },
    {
      accessorKey: 'email',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-3 h-8"
          >
            Email
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div className="lowercase">{row.getValue('email')}</div>,
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => {
        const role = row.getValue('role') as string;
        return (
          <Badge variant={role === 'admin' ? 'default' : 'secondary'}>
            {role === 'admin' ? (
              <ShieldCheck className="mr-1 size-3" />
            ) : (
              <UserIcon className="mr-1 size-3" />
            )}
            {role}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'account_status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('account_status') as string;
        return (
          <Badge
            variant={
              status === 'verified' ? 'success' : status === 'suspended' ? 'destructive' : 'warning'
            }
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'email_verified',
      header: 'Email Verified',
      cell: ({ row }) => {
        const verified = row.getValue('email_verified') as boolean;
        return <Badge variant={verified ? 'success' : 'warning'}>{verified ? 'Yes' : 'No'}</Badge>;
      },
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-3 h-8"
          >
            Created
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue('created_at'));
        return <div className="text-sm">{date.toLocaleDateString()}</div>;
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original;
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedUserId(user.id);
              setDetailsOpen(true);
            }}
          >
            <Eye className="mr-2 size-4" />
            View
          </Button>
        );
      },
    },
  ];

  const table = useReactTable({
    data: users,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

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
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Search bar */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by username or email..."
                    value={(table.getColumn('username')?.getFilterValue() as string) ?? ''}
                    onChange={(event) =>
                      table.getColumn('username')?.setFilterValue(event.target.value)
                    }
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                          return (
                            <TableHead key={header.id}>
                              {header.isPlaceholder
                                ? null
                                : flexRender(header.column.columnDef.header, header.getContext())}
                            </TableHead>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center">
                          No users found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {table.getState().pagination.pageIndex * 10 + 1} to{' '}
                  {Math.min((table.getState().pagination.pageIndex + 1) * 10, users.length)} of{' '}
                  {users.length} users
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Sheet */}
      <UserDetailsSheet
        userId={selectedUserId}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onUserUpdated={() => fetchUsers()}
      />
    </div>
  );
}
