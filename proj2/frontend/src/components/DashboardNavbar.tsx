import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import apiClient, { clearAuthToken } from '@/lib/api';
import { User, LogOut, Heart, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

interface UserInfo {
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
}

export function DashboardNavbar() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await apiClient.get('/users/me');
        setUserInfo(response.data);
      } catch (error) {
        console.error('Failed to fetch user info:', error);
      }
    };

    fetchUserInfo();
  }, []);

  const handleLogout = () => {
    clearAuthToken();
    navigate('/');
  };

  const handleNavigateToHealthProfile = () => {
    navigate('/health-profile');
  };

  const handleNavigateToAdminDashboard = () => {
    navigate('/system-manage');
  };

  const isAdmin = userInfo?.role === 'admin';

  const getUserDisplayName = () => {
    if (!userInfo) return 'User';

    if (userInfo.first_name && userInfo.last_name) {
      return `${userInfo.first_name} ${userInfo.last_name}`;
    }
    if (userInfo.first_name) {
      return userInfo.first_name;
    }
    if (userInfo.email) {
      return userInfo.email.split('@')[0];
    }
    return 'User';
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 shadow-sm backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <div className="flex items-center">
          <a
            href="/dashboard"
            className="mr-8 text-2xl font-semibold tracking-tight text-emerald-600"
          >
            Eatsential
          </a>
          <nav className="hidden text-gray-800 md:flex">
            <NavigationMenu>
              <NavigationMenuList className="gap-2">
                <NavigationMenuItem>
                  <NavigationMenuLink
                    className="rounded-md px-4 py-2 text-sm font-semibold hover:bg-gray-100"
                    href="/dashboard"
                  >
                    Dashboard
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink
                    className="rounded-md px-4 py-2 text-sm font-semibold hover:bg-gray-100"
                    href="/wellness-tracking"
                  >
                    Wellness
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink
                    className="rounded-md px-4 py-2 text-sm font-semibold hover:bg-gray-100"
                    href="#recipes"
                  >
                    Recipes
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink
                    className="rounded-md px-4 py-2 text-sm font-semibold hover:bg-gray-100"
                    href="#meal-plans"
                  >
                    Meal Plans
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-white hover:bg-gray-50"
              >
                <User className="h-4 w-4" />
                <span className="hidden md:inline">{getUserDisplayName()}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleNavigateToHealthProfile} className="cursor-pointer">
                <Heart className="mr-2 h-4 w-4" />
                <span>Health Profile</span>
              </DropdownMenuItem>
              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleNavigateToAdminDashboard}
                    className="cursor-pointer"
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Admin Dashboard</span>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
