import { MapPin, Utensils, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { RestaurantInfo as RestaurantInfoType, MenuItemInfo } from '@/lib/api';

interface RestaurantInfoProps {
  restaurant: RestaurantInfoType;
  menuItem?: MenuItemInfo;
}

export function RestaurantInfo({ restaurant, menuItem }: RestaurantInfoProps) {
  return (
    <Card className="mt-4">
      <CardContent className="space-y-3 pt-4">
        {/* Restaurant Name and Status */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">{restaurant.name}</h3>
          </div>
          {restaurant.is_active ? (
            <Badge variant="default" className="bg-green-500">
              Open
            </Badge>
          ) : (
            <Badge variant="secondary">Closed</Badge>
          )}
        </div>

        {/* Cuisine Type */}
        {restaurant.cuisine && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Utensils className="h-4 w-4" />
            <span>{restaurant.cuisine}</span>
          </div>
        )}

        {/* Address */}
        {restaurant.address && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{restaurant.address}</span>
          </div>
        )}

        {/* Menu Item Details */}
        {menuItem && (
          <div className="space-y-2 border-t pt-3">
            <h4 className="font-medium">{menuItem.name}</h4>

            {menuItem.description && (
              <p className="text-sm text-muted-foreground">{menuItem.description}</p>
            )}

            <div className="mt-2 flex flex-wrap gap-2">
              {/* Price */}
              {menuItem.price !== undefined && menuItem.price !== null && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  <span>${menuItem.price.toFixed(2)}</span>
                </Badge>
              )}

              {/* Calories */}
              {menuItem.calories !== undefined && menuItem.calories !== null && (
                <Badge variant="outline">{Math.round(menuItem.calories)} cal</Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
