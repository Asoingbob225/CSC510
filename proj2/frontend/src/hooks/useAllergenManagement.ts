import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { adminApi, type AllergenUpdate } from '@/lib/api';

export function useAllergenManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for fetching allergens
  const allergensQuery = useQuery({
    queryKey: ['allergens'],
    queryFn: adminApi.getAllergens,
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
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create allergen',
        variant: 'destructive',
      });
    },
  });

  // Mutation for updating allergen
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AllergenUpdate }) =>
      adminApi.updateAllergen(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allergens'] });
      toast({
        title: 'Success',
        description: 'Allergen updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update allergen',
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
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete allergen',
        variant: 'destructive',
      });
    },
  });

  // Mutation for bulk import
  const bulkImportMutation = useMutation({
    mutationFn: adminApi.bulkImportAllergens,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['allergens'] });
      const errorMsg = data.errors.length > 0 ? ` Errors: ${data.errors.join(', ')}` : '';
      toast({
        title: 'Bulk Import Complete',
        description: `Successfully imported ${data.imported} allergen(s). ${data.skipped} skipped.${errorMsg}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Import Failed',
        description: error.message || 'Failed to import allergens',
        variant: 'destructive',
      });
    },
  });

  return {
    allergens: allergensQuery.data ?? [],
    isLoading: allergensQuery.isLoading,
    createAllergen: createMutation.mutate,
    updateAllergen: updateMutation.mutate,
    deleteAllergen: deleteMutation.mutate,
    bulkImport: bulkImportMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isImporting: bulkImportMutation.isPending,
  };
}
