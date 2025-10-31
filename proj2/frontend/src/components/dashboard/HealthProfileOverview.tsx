import { useNavigate } from 'react-router';
import { User, Ruler, Weight, Heart, ArrowRight, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useHealthProfile, useAllergens } from '@/hooks/useHealthProfile';

export function HealthProfileOverview() {
  const navigate = useNavigate();
  const { data: healthProfile, isLoading: profileLoading } = useHealthProfile();
  const { data: allergens, isLoading: allergensLoading } = useAllergens();

  const isLoading = profileLoading || allergensLoading;

  // Calculate BMI if height and weight are available
  const calculateBMI = (heightCm?: number, weightKg?: number): number | null => {
    if (!heightCm || !weightKg) return null;
    const heightM = heightCm / 100;
    return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
  };

  const bmi = calculateBMI(healthProfile?.height_cm, healthProfile?.weight_kg);

  // Helper to get allergen name by ID
  const getAllergenName = (allergenId: string): string => {
    const allergen = allergens?.find((a) => a.id === allergenId);
    return allergen?.name || 'Unknown';
  };

  // Get first 3 allergies for display
  const topAllergies = healthProfile?.allergies?.slice(0, 3) || [];
  const hasMoreAllergies = (healthProfile?.allergies?.length || 0) > 3;

  if (isLoading) {
    return (
      <Card className="border-2 border-indigo-200 bg-linear-to-br from-indigo-50 to-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="size-5 text-indigo-600" />
            Health Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    );
  }

  // If no health profile exists
  if (!healthProfile) {
    return (
      <Card
        className="relative flex cursor-pointer flex-col justify-center border-2 py-4 transition-all hover:border-indigo-300 hover:shadow-lg"
        onClick={() => navigate('/health-profile')}
      >
        <ArrowUpRight className="absolute top-3 right-3 size-4 text-gray-400" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="size-5 text-emerald-600" />
            Health Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">
            No health profile yet. Create one to track your health data.
          </p>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate('/health-profile');
            }}
            className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
          >
            Create Profile
            <ArrowRight className="size-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="relative flex cursor-pointer flex-col justify-center border-2 py-4 transition-all hover:border-indigo-300 hover:shadow-lg"
      onClick={() => navigate('/health-profile')}
    >
      <ArrowUpRight className="absolute top-3 right-3 size-4 text-gray-400" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="size-5 text-emerald-600" />
          Health Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {/* Basic Information */}

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-700">
            <Weight className="size-4 text-emerald-500" />
            <span className="font-medium">Weight:</span>
          </div>
          <div className="text-right">
            <span className="font-semibold text-gray-900">
              {healthProfile.weight_kg ? `${healthProfile.weight_kg} kg` : 'N/A'}
            </span>
            {bmi && <span className="ml-2 text-xs text-gray-500">BMI: {bmi}</span>}
          </div>
        </div>

        {/* Allergies */}
        <div className="flex justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-700">
            <Heart className="size-4 text-red-500" />
            <span className="font-medium">Allergies:</span>
          </div>
          {topAllergies.length > 0 ? (
            <div className="ml-6 flex flex-wrap justify-end-safe space-y-1">
              {topAllergies.map((allergy) => (
                <div key={allergy.id} className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="rounded-full bg-red-100 px-2 py-0.5 font-medium text-red-700">
                    {getAllergenName(allergy.allergen_id)}
                  </span>
                </div>
              ))}
              {hasMoreAllergies && (
                <p className="text-xs text-gray-500 italic">
                  +{(healthProfile.allergies?.length || 0) - 3} more...
                </p>
              )}
            </div>
          ) : (
            <p className="ml-6 text-xs text-gray-500">No allergies recorded</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
