import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit3, User, Activity, Heart, Utensils, AlertCircle } from 'lucide-react';
import {
  healthProfileApi,
  getAuthToken,
  clearAuthToken,
  type HealthProfile,
  type Allergen,
} from '@/lib/api';
import { InfoCard, StatCard, ListItemCard } from '@/components/profile';

// Activity level display mapping
const activityLevelLabels: Record<string, string> = {
  sedentary: 'Sedentary',
  light: 'Light activity',
  moderate: 'Moderate activity',
  active: 'Active',
  very_active: 'Very active',
};

// Severity level display
const severityLabels: Record<string, { label: string; color: string }> = {
  mild: { label: 'Mild', color: 'bg-yellow-100 text-yellow-800' },
  moderate: { label: 'Moderate', color: 'bg-orange-100 text-orange-800' },
  severe: { label: 'Severe', color: 'bg-red-100 text-red-800' },
  life_threatening: { label: 'Life-threatening', color: 'bg-red-200 text-red-900' },
};

// Preference type display
const preferenceTypeLabels: Record<string, string> = {
  diet: 'Diet',
  cuisine: 'Cuisine',
  ingredient: 'Ingredient',
  preparation: 'Preparation',
};

function HealthProfilePage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
  const [allergens, setAllergens] = useState<Allergen[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Helper function to get allergen info
  const getAllergenInfo = (allergenId: string) => {
    return allergens.find((a) => a.id === allergenId);
  };

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

  const handleLogout = () => {
    clearAuthToken();
    navigate('/');
  };

  const handleEdit = () => {
    // TODO: Navigate to edit page or toggle edit mode
    console.log('Edit profile');
  };

  // Calculate BMI if height and weight are available
  const calculateBMI = () => {
    if (healthProfile?.height_cm && healthProfile?.weight_kg) {
      const heightInMeters = healthProfile.height_cm / 100;
      const bmi = healthProfile.weight_kg / (heightInMeters * heightInMeters);
      return bmi.toFixed(1);
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-50">
        <div className="text-center">
          <div className="mb-4 text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  const bmi = calculateBMI();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Header */}
      {/* Header */}
      <header className="bg-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="ghost"
              className="rounded-full p-2 text-gray-600 transition-all duration-300 hover:bg-green-50 hover:text-green-600"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <h1 className="text-2xl font-semibold text-gray-800">Health Profile</h1>
          </div>
          <Button
            onClick={handleLogout}
            className="rounded-full border-0 bg-white px-6 py-2 text-gray-700 shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:bg-gray-50 hover:shadow-[0_12px_40px_rgb(0,0,0,0.16)]"
          >
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-12">
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
              onClick={handleEdit}
              className="rounded-full border-0 bg-green-500 px-8 py-3 text-white shadow-[0_8px_30px_rgb(34,197,94,0.3)] transition-all duration-300 hover:bg-green-600 hover:shadow-[0_12px_40px_rgb(34,197,94,0.4)]"
            >
              Create Health Profile
            </Button>
          </div>
        )}

        {/* Profile Content */}
        {healthProfile && (
          <div>
            {/* Action Buttons */}
            <div className="mb-6 flex justify-end">
              <Button
                onClick={handleEdit}
                className="flex items-center gap-2 rounded-full border-0 bg-green-500 px-6 py-3 text-white shadow-[0_8px_30px_rgb(34,197,94,0.3)] transition-all duration-300 hover:bg-green-600 hover:shadow-[0_12px_40px_rgb(34,197,94,0.4)]"
              >
                <Edit3 className="size-4" />
                Edit Profile
              </Button>
            </div>

            {/* Two Column Layout */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Left Column - Basic Information */}
              <div>
                <InfoCard icon={User} title="Basic Information">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <StatCard
                      label="Height"
                      value={healthProfile.height_cm || 'Not set'}
                      unit={healthProfile.height_cm ? 'cm' : undefined}
                    />
                    <StatCard
                      label="Weight"
                      value={healthProfile.weight_kg || 'Not set'}
                      unit={healthProfile.weight_kg ? 'kg' : undefined}
                    />
                    {bmi && <StatCard label="BMI" value={bmi} />}
                    <StatCard
                      label="Activity Level"
                      value={
                        healthProfile.activity_level
                          ? activityLevelLabels[healthProfile.activity_level] ||
                            healthProfile.activity_level
                          : 'Not set'
                      }
                      icon={<Activity className="size-4" />}
                    />
                  </div>
                </InfoCard>
              </div>

              {/* Right Column - Allergies and Dietary Preferences */}
              <div className="space-y-6">
                {/* Allergies Section */}
                <InfoCard
                  icon={Heart}
                  title="Allergies"
                  iconBgColor="bg-red-100"
                  iconColor="text-red-600"
                >
                  {healthProfile.allergies && healthProfile.allergies.length > 0 ? (
                    <div className="space-y-3">
                      {healthProfile.allergies.map((allergy) => {
                        const allergenInfo = getAllergenInfo(allergy.allergen_id);
                        const details = [];

                        if (allergenInfo?.category) {
                          details.push({ label: 'Category', value: allergenInfo.category });
                        }
                        if (allergy.reaction_type) {
                          details.push({ label: 'Reaction Type', value: allergy.reaction_type });
                        }
                        if (allergy.diagnosed_date) {
                          details.push({
                            label: 'Diagnosed Date',
                            value: new Date(allergy.diagnosed_date).toLocaleDateString('en-US'),
                          });
                        }

                        const badges = [
                          <span
                            key="severity"
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              severityLabels[allergy.severity]?.color || 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {severityLabels[allergy.severity]?.label || allergy.severity}
                          </span>,
                        ];

                        if (allergy.is_verified) {
                          badges.push(
                            <span
                              key="verified"
                              className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800"
                            >
                              Verified
                            </span>
                          );
                        }

                        return (
                          <ListItemCard
                            key={allergy.id}
                            title={allergenInfo?.name || 'Unknown allergen'}
                            badges={badges}
                            details={details}
                            notes={allergy.notes}
                            bgColor="bg-red-50"
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-gray-50 p-8 text-center">
                      <p className="text-gray-500">No allergies yet</p>
                    </div>
                  )}
                </InfoCard>

                {/* Dietary Preferences Section */}
                <InfoCard icon={Utensils} title="Dietary Preferences">
                  {healthProfile.dietary_preferences &&
                  healthProfile.dietary_preferences.length > 0 ? (
                    <div className="space-y-3">
                      {healthProfile.dietary_preferences.map((pref) => {
                        const details = [];
                        if (pref.reason) {
                          details.push({ label: 'Reason', value: pref.reason });
                        }

                        const badges = [
                          <span
                            key="type"
                            className="rounded-full bg-green-200 px-3 py-1 text-xs font-medium text-green-800"
                          >
                            {preferenceTypeLabels[pref.preference_type] || pref.preference_type}
                          </span>,
                        ];

                        if (pref.is_strict) {
                          badges.push(
                            <span
                              key="strict"
                              className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-800"
                            >
                              Strict
                            </span>
                          );
                        }

                        return (
                          <ListItemCard
                            key={pref.id}
                            title={pref.preference_name}
                            badges={badges}
                            details={details}
                            notes={pref.notes}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-gray-50 p-8 text-center">
                      <p className="text-gray-500">No dietary preferences yet</p>
                    </div>
                  )}
                </InfoCard>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default HealthProfilePage;
