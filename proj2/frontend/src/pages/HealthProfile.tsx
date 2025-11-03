import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { User, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { healthProfileApi, getAuthToken, type HealthProfile, type Allergen } from '@/lib/api';
import { BasicInfoCard, AllergiesCard, DietaryPreferencesCard } from '@/components/health-profile';
import { DashboardNavbar } from '@/components/DashboardNavbar';
import { Button } from '@/components/ui/button';

function HealthProfilePage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
  const [allergens, setAllergens] = useState<Allergen[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Check auth and load data
  useEffect(() => {
    const loadData = async () => {
      const token = getAuthToken();
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        setIsLoading(true);

        // Load allergens list
        const allergensResponse = await healthProfileApi.listAllergens();
        setAllergens(allergensResponse.data);

        // Try to load existing profile
        try {
          const profileResponse = await healthProfileApi.getProfile();
          setHealthProfile(profileResponse.data);
        } catch (profileError: unknown) {
          // If profile doesn't exist (404), that's ok
          if (
            profileError &&
            typeof profileError === 'object' &&
            'response' in profileError &&
            profileError.response &&
            typeof profileError.response === 'object' &&
            'status' in profileError.response &&
            profileError.response.status !== 404
          ) {
            throw profileError;
          }
          setHealthProfile(null);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load health profile data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  // Handle profile updates from child components
  const handleProfileUpdate = (updatedProfile: HealthProfile) => {
    setHealthProfile(updatedProfile);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-emerald-50">
        <div className="text-center">
          <div className="mb-4 text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50">
      <DashboardNavbar />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            Back to Dashboard
          </Button>
        </div>

        <h1 className="mb-8 text-2xl font-bold text-gray-800">My Health Profile</h1>
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-3xl bg-red-50 px-6 py-4 shadow-lg">
            <AlertCircle className="size-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* No Profile State */}
        {!healthProfile && !error && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-8 rounded-full bg-green-100 p-8 shadow-xl">
              <User className="size-16 text-green-600" />
            </div>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800">No health profile yet</h2>
            <p className="mb-8 text-center text-gray-600">
              Create your health profile to get personalized dietary recommendations
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/health-profile-wizard')}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              Create Health Profile
              <ArrowRight className="size-4" />
            </Button>
          </div>
        )}

        {/* Profile Content */}
        {healthProfile && (
          <div>
            {/* Two Column Layout */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left Column - Basic Information */}
              <div className="col-span-1">
                <BasicInfoCard healthProfile={healthProfile} onUpdate={handleProfileUpdate} />
              </div>

              {/* Right Column - Allergies and Dietary Preferences */}
              <div className="col-span-2 space-y-6">
                {/* Allergies Section */}
                <AllergiesCard
                  healthProfile={healthProfile}
                  allergens={allergens}
                  onUpdate={handleProfileUpdate}
                />

                {/* Dietary Preferences Section */}
                <DietaryPreferencesCard
                  healthProfile={healthProfile}
                  onUpdate={handleProfileUpdate}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default HealthProfilePage;
