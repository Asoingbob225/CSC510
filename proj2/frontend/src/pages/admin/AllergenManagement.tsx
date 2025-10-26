import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Plus, Pencil, Trash2, Search, AlertTriangle, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { adminApi, type AllergenResponse, type AllergenCreate } from '@/lib/api';

export default function AllergenManagement() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAllergen, setSelectedAllergen] = useState<AllergenResponse | null>(null);
  const [formData, setFormData] = useState<AllergenCreate>({
    name: '',
    category: '',
    is_major_allergen: false,
    description: '',
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for fetching allergens
  const { data: allergens = [], isLoading } = useQuery({
    queryKey: ['allergens'],
    queryFn: adminApi.getAllergens,
  });

  // Define columns
  const columns: ColumnDef<AllergenResponse>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="-ml-3 h-8"
            >
              Name
              <ArrowUpDown className="ml-2 size-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div className="font-medium capitalize">{row.getValue('name')}</div>,
      },
      {
        accessorKey: 'category',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="-ml-3 h-8"
            >
              Category
              <ArrowUpDown className="ml-2 size-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div className="capitalize">{row.getValue('category')}</div>,
      },
      {
        accessorKey: 'is_major_allergen',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="-ml-3 h-8"
            >
              Type
              <ArrowUpDown className="ml-2 size-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const isMajor = row.getValue('is_major_allergen') as boolean;
          return isMajor ? (
            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
              <AlertTriangle className="mr-1 size-3" />
              Major
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
              Common
            </span>
          );
        },
        // Custom sort function to put major allergens first
        sortingFn: (rowA, rowB) => {
          const a = rowA.getValue('is_major_allergen') as boolean;
          const b = rowB.getValue('is_major_allergen') as boolean;
          // Major (true) should come before Common (false)
          if (a === b) return 0;
          return a ? -1 : 1;
        },
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => {
          const description = row.getValue('description') as string | undefined;
          return (
            <div className="max-w-xs truncate text-sm text-gray-600">{description || '-'}</div>
          );
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const allergen = row.original;
          return (
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => handleEdit(allergen)}>
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(allergen)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    []
  );

  // Initialize table
  const table = useReactTable({
    data: allergens,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Mutation for creating allergen
  const createMutation = useMutation({
    mutationFn: adminApi.createAllergen,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allergens'] });
      toast({
        title: 'Success',
        description: 'Allergen created successfully',
      });
      setIsCreateDialogOpen(false);
    },
    onError: (error) => {
      const errorMessage =
        error && typeof error === 'object' && 'response' in error
          ? String((error as { response?: { data?: { detail?: string } } }).response?.data?.detail)
          : 'Failed to create allergen';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  // Mutation for updating allergen
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AllergenCreate }) =>
      adminApi.updateAllergen(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allergens'] });
      toast({
        title: 'Success',
        description: 'Allergen updated successfully',
      });
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      const errorMessage =
        error && typeof error === 'object' && 'response' in error
          ? String((error as { response?: { data?: { detail?: string } } }).response?.data?.detail)
          : 'Failed to update allergen';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  // Mutation for deleting allergen
  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteAllergen,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allergens'] });
      toast({
        title: 'Success',
        description: 'Allergen deleted successfully',
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      const errorMessage =
        error && typeof error === 'object' && 'response' in error
          ? String((error as { response?: { data?: { detail?: string } } }).response?.data?.detail)
          : 'Failed to delete allergen';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  const handleCreate = () => {
    setFormData({
      name: '',
      category: '',
      is_major_allergen: false,
      description: '',
    });
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (allergen: AllergenResponse) => {
    setSelectedAllergen(allergen);
    setFormData({
      name: allergen.name,
      category: allergen.category,
      is_major_allergen: allergen.is_major_allergen,
      description: allergen.description || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (allergen: AllergenResponse) => {
    setSelectedAllergen(allergen);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmitCreate = () => {
    if (!formData.name.trim() || !formData.category.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Name and category are required',
        variant: 'destructive',
      });
      return;
    }

    createMutation.mutate(formData);
  };

  const handleSubmitEdit = () => {
    if (!selectedAllergen || !formData.name.trim() || !formData.category.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Name and category are required',
        variant: 'destructive',
      });
      return;
    }

    updateMutation.mutate({ id: selectedAllergen.id, data: formData });
  };

  const handleConfirmDelete = () => {
    if (!selectedAllergen) return;

    deleteMutation.mutate(selectedAllergen.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Allergen Management</h1>
        <p className="mt-2 text-gray-600">
          Manage the central allergen database used for user health profiles.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Allergens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allergens.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Major Allergens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allergens.filter((a) => a.is_major_allergen).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(allergens.map((a) => a.category)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="text-blue-600" />
            <div>
              <CardTitle>Allergen Database</CardTitle>
              <CardDescription>View and manage all allergens</CardDescription>
            </div>
            <div className="grow" />
            <Button onClick={handleCreate}>
              <Plus className="mr-2 size-4" />
              Add Allergen
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search allergens by name, category, or description..."
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="py-8 text-center text-gray-500">Loading allergens...</div>
          ) : (
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
                      <TableRow key={row.id}>
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
                        No allergens found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Allergen</DialogTitle>
            <DialogDescription>
              Create a new allergen to be used in user health profiles.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Peanuts, Milk, Eggs"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                placeholder="e.g., nuts, dairy, grain"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_major"
                checked={formData.is_major_allergen}
                onCheckedChange={(checked: boolean) =>
                  setFormData({ ...formData, is_major_allergen: checked })
                }
              />
              <Label htmlFor="is_major" className="cursor-pointer font-normal">
                Major allergen (FDA Big 9)
              </Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Optional description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Allergen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Allergen</DialogTitle>
            <DialogDescription>Update allergen information.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category *</Label>
              <Input
                id="edit-category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-is_major"
                checked={formData.is_major_allergen}
                onCheckedChange={(checked: boolean) =>
                  setFormData({ ...formData, is_major_allergen: checked })
                }
              />
              <Label htmlFor="edit-is_major" className="cursor-pointer font-normal">
                Major allergen (FDA Big 9)
              </Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitEdit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Updating...' : 'Update Allergen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the allergen &ldquo;{selectedAllergen?.name}&rdquo;. This
              action cannot be undone.
              {selectedAllergen?.is_major_allergen && (
                <div className="mt-2 rounded-md bg-red-50 p-3">
                  <p className="text-sm font-medium text-red-800">
                    ⚠️ Warning: This is a major allergen. Deleting it may affect user health
                    profiles.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
