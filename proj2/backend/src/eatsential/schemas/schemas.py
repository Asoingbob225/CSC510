"""Pydantic schemas for API request/response validation."""

import re
from datetime import date, datetime
from typing import Annotated, Optional

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    computed_field,
    field_validator,
)

from ..models.models import (
    ActivityLevel,
    AllergySeverity,
    GoalStatus,
    GoalType,
    MealType,
    PreferenceType,
    UserRole,
)


class UserBase(BaseModel):
    """Pydantic model for general user information"""

    username: str
    email: str
    role: str = UserRole.USER


class UserCreate(BaseModel):
    """Pydantic model for user registration request"""

    username: Annotated[
        str, Field(min_length=3, max_length=20, pattern=r"^[a-zA-Z0-9_-]+$")
    ]
    email: EmailStr
    password: str

    @field_validator("username")
    @classmethod
    def username_reserved_validation(cls, value: str) -> str:
        """Validate username is not reserved"""
        reserved_usernames = {
            "admin",
            "root",
            "system",
            "support",
            "help",
            "administrator",
        }
        if value.lower() in reserved_usernames:
            raise ValueError("this username is reserved")
        return value

    @field_validator("password")
    @classmethod
    def password_validation(cls, value: str) -> str:
        """Validate password meets all requirements"""
        if len(value) < 8:
            raise ValueError("string should have at least 8 characters")
        if len(value) > 48:
            raise ValueError("string should have at most 48 characters")
        if not any(c.isupper() for c in value):
            raise ValueError("password must contain at least one uppercase letter")
        if not any(c.islower() for c in value):
            raise ValueError("password must contain at least one lowercase letter")
        if not any(c.isdigit() for c in value):
            raise ValueError("password must contain at least one number")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            raise ValueError("password must contain at least one special character")
        return value


class UserLogin(BaseModel):
    """Pydantic model for user login request"""

    email: EmailStr
    password: str


class UserResponse(UserBase):
    """Pydantic model for user response"""

    model_config = ConfigDict(from_attributes=True)
    id: str
    message: str


class LoginResponse(UserBase):
    """Pydantic model for login response with JWT token"""

    model_config = ConfigDict(from_attributes=True)
    id: str
    access_token: str
    token_type: str = "bearer"  # noqa: S105
    message: str
    has_completed_wizard: bool


class EmailRequest(BaseModel):
    """Pydantic model for email request body"""

    email: EmailStr


# --- Common Schemas ---


class MessageResponse(BaseModel):
    """Generic message response schema"""

    model_config = ConfigDict(from_attributes=True)

    message: str


# --- Health Profile Schemas ---


class UserAllergyCreate(BaseModel):
    """Schema for creating a user allergy"""

    allergen_id: str
    severity: AllergySeverity
    diagnosed_date: Optional[date] = None
    reaction_type: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = None
    is_verified: bool = False


class UserAllergyUpdate(BaseModel):
    """Schema for updating a user allergy"""

    severity: Optional[AllergySeverity] = None
    diagnosed_date: Optional[date] = None
    reaction_type: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = None
    is_verified: Optional[bool] = None


class UserAllergyResponse(BaseModel):
    """Schema for user allergy response"""

    model_config = ConfigDict(from_attributes=True)

    id: str
    health_profile_id: str
    allergen_id: str
    severity: str
    diagnosed_date: Optional[date] = None
    reaction_type: Optional[str] = None
    notes: Optional[str] = None
    is_verified: bool
    created_at: datetime
    updated_at: datetime


class DietaryPreferenceCreate(BaseModel):
    """Schema for creating a dietary preference"""

    preference_type: PreferenceType
    preference_name: Annotated[str, Field(min_length=1, max_length=100)]
    is_strict: bool = True
    reason: Optional[str] = None
    notes: Optional[str] = None


class DietaryPreferenceUpdate(BaseModel):
    """Schema for updating a dietary preference"""

    preference_name: Optional[Annotated[str, Field(min_length=1, max_length=100)]] = (
        None
    )
    is_strict: Optional[bool] = None
    reason: Optional[str] = None
    notes: Optional[str] = None


class DietaryPreferenceResponse(BaseModel):
    """Schema for dietary preference response"""

    model_config = ConfigDict(from_attributes=True)

    id: str
    health_profile_id: str
    preference_type: str
    preference_name: str
    is_strict: bool
    reason: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class HealthProfileCreate(BaseModel):
    """Schema for creating a health profile"""

    height_cm: Optional[Annotated[float, Field(gt=0, lt=300)]] = None
    weight_kg: Optional[Annotated[float, Field(gt=0, lt=500)]] = None
    activity_level: Optional[ActivityLevel] = None
    metabolic_rate: Optional[int] = None


class HealthProfileUpdate(BaseModel):
    """Schema for updating a health profile"""

    height_cm: Optional[Annotated[float, Field(gt=0, lt=300)]] = None
    weight_kg: Optional[Annotated[float, Field(gt=0, lt=500)]] = None
    activity_level: Optional[ActivityLevel] = None
    metabolic_rate: Optional[int] = None


class HealthProfileResponse(BaseModel):
    """Schema for health profile response"""

    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    activity_level: Optional[str] = None
    metabolic_rate: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    allergies: list[UserAllergyResponse] = []
    dietary_preferences: list[DietaryPreferenceResponse] = []


class AllergenCreate(BaseModel):
    """Schema for allergen creation"""

    name: str
    category: str
    is_major_allergen: bool = False
    description: Optional[str] = None


class AllergenUpdate(BaseModel):
    """Schema for allergen update"""

    name: Optional[str] = None
    category: Optional[str] = None
    is_major_allergen: Optional[bool] = None
    description: Optional[str] = None


class AllergenResponse(BaseModel):
    """Schema for allergen response"""

    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    category: str
    is_major_allergen: bool
    description: Optional[str] = None


# --- Admin User Management Schemas ---


class UserListResponse(BaseModel):
    """Schema for user list response (admin view)"""

    model_config = ConfigDict(from_attributes=True)

    id: str
    username: str
    email: str
    role: str
    account_status: str
    email_verified: bool
    created_at: datetime
    updated_at: datetime


class UserDetailResponse(BaseModel):
    """Schema for detailed user response (admin view)"""

    model_config = ConfigDict(from_attributes=True)

    id: str
    username: str
    email: str
    role: str
    account_status: str
    email_verified: bool
    verification_token_expires: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class UserProfileUpdate(BaseModel):
    """Schema for updating user profile (admin)"""

    username: Optional[Annotated[str, Field(min_length=3, max_length=20)]] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    account_status: Optional[str] = None
    email_verified: Optional[bool] = None


# --- Meal Logging Schemas ---


class MealFoodItemCreate(BaseModel):
    """Schema for creating a food item in a meal"""

    food_name: Annotated[str, Field(min_length=1, max_length=200)]
    portion_size: Annotated[float, Field(gt=0)]
    portion_unit: Annotated[str, Field(min_length=1, max_length=20)]
    calories: Optional[float] = Field(None, ge=0)
    protein_g: Optional[float] = Field(None, ge=0)
    carbs_g: Optional[float] = Field(None, ge=0)
    fat_g: Optional[float] = Field(None, ge=0)


class MealFoodItemResponse(BaseModel):
    """Schema for food item response"""

    model_config = ConfigDict(from_attributes=True)

    id: str
    food_name: str
    portion_size: float
    portion_unit: str
    calories: Optional[float] = None
    protein_g: Optional[float] = None
    carbs_g: Optional[float] = None
    fat_g: Optional[float] = None
    created_at: datetime


class MealCreate(BaseModel):
    """Schema for creating a meal log"""

    meal_type: MealType
    meal_time: datetime
    notes: Optional[str] = Field(None, max_length=1000)
    photo_url: Optional[str] = Field(None, max_length=500)
    food_items: list[MealFoodItemCreate] = Field(min_length=1)

    @field_validator("meal_time")
    @classmethod
    def validate_meal_time(cls, value: datetime) -> datetime:
        """Validate meal time is within last 30 days"""
        now = datetime.now()
        days_diff = (now - value).days

        if days_diff > 30:
            raise ValueError("meal_time must be within the last 30 days")
        if value > now:
            raise ValueError("meal_time cannot be in the future")

        return value


class MealUpdate(BaseModel):
    """Schema for updating a meal log"""

    meal_type: Optional[MealType] = None
    meal_time: Optional[datetime] = None
    notes: Optional[str] = Field(None, max_length=1000)
    photo_url: Optional[str] = Field(None, max_length=500)
    food_items: Optional[list[MealFoodItemCreate]] = Field(None, min_length=1)

    @field_validator("meal_time")
    @classmethod
    def validate_meal_time(cls, value: Optional[datetime]) -> Optional[datetime]:
        """Validate meal time is within last 30 days"""
        if value is None:
            return value

        now = datetime.now()
        days_diff = (now - value).days

        if days_diff > 30:
            raise ValueError("meal_time must be within the last 30 days")
        if value > now:
            raise ValueError("meal_time cannot be in the future")

        return value


class MealResponse(BaseModel):
    """Schema for meal log response"""

    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    meal_type: str
    meal_time: datetime
    notes: Optional[str] = None
    photo_url: Optional[str] = None
    total_calories: Optional[float] = None
    total_protein_g: Optional[float] = None
    total_carbs_g: Optional[float] = None
    total_fat_g: Optional[float] = None
    food_items: list[MealFoodItemResponse] = []
    created_at: datetime
    updated_at: datetime


class MealListResponse(BaseModel):
    """Schema for paginated meal list response"""

    meals: list[MealResponse]
    total: int
    page: int
    page_size: int


# --- Goal Tracking Schemas ---


class GoalCreate(BaseModel):
    """Schema for creating a goal"""

    goal_type: GoalType
    target_type: Annotated[str, Field(min_length=1, max_length=100)]
    target_value: Annotated[float, Field(gt=0)]
    start_date: date
    end_date: date
    notes: Optional[str] = Field(None, max_length=1000)

    @field_validator("end_date")
    @classmethod
    def validate_end_date(cls, value: date, info) -> date:
        """Validate end_date is after start_date"""
        start_date = info.data.get("start_date")
        if start_date and value <= start_date:
            raise ValueError("end_date must be after start_date")
        return value

    @field_validator("start_date")
    @classmethod
    def validate_start_date(cls, value: date) -> date:
        """Validate start_date is not too far in the past"""
        days_diff = (date.today() - value).days
        if days_diff > 365:
            raise ValueError("start_date cannot be more than 365 days in the past")
        return value


class GoalUpdate(BaseModel):
    """Schema for updating a goal"""

    target_type: Optional[str] = Field(None, min_length=1, max_length=100)
    target_value: Optional[float] = Field(None, gt=0)
    current_value: Optional[float] = Field(None, ge=0)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[GoalStatus] = None
    notes: Optional[str] = Field(None, max_length=1000)

    @field_validator("end_date")
    @classmethod
    def validate_end_date(cls, value: Optional[date], info) -> Optional[date]:
        """Validate end_date is after start_date if both provided"""
        if value is None:
            return value

        start_date = info.data.get("start_date")
        if start_date and value <= start_date:
            raise ValueError("end_date must be after start_date")
        return value


class GoalResponse(BaseModel):
    """Schema for goal response"""

    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    goal_type: str
    target_type: str
    target_value: float
    current_value: float
    start_date: date
    end_date: date
    status: str
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    @computed_field
    @property
    def completion_percentage(self) -> float:
        """Calculate goal completion percentage"""
        if self.target_value <= 0:
            return 0.0
        percentage = (self.current_value / self.target_value) * 100
        return min(percentage, 100.0)

    @computed_field
    @property
    def is_active(self) -> bool:
        """Check if goal is currently active"""
        today = date.today()
        return (
            self.status == GoalStatus.ACTIVE.value
            and self.start_date <= today <= self.end_date
        )


class GoalListResponse(BaseModel):
    """Schema for paginated goal list response"""

    goals: list[GoalResponse]
    total: int
    page: int
    page_size: int


class GoalProgressResponse(BaseModel):
    """Schema for goal progress statistics"""

    goal_id: str
    goal_type: str
    target_type: str
    target_value: float
    current_value: float
    completion_percentage: float
    status: str
    days_remaining: int


# ============================================================================
# Mental Wellness Schemas
# ============================================================================


class MoodLogCreate(BaseModel):
    """Schema for creating a mood log"""

    log_date: date
    mood_score: int = Field(..., ge=1, le=10, description="Mood score from 1 to 10")
    notes: Optional[str] = Field(None, max_length=1000, description="Optional notes")

    @field_validator("log_date")
    @classmethod
    def validate_log_date(cls, v: date) -> date:
        """Validate log date is within last 7 days"""
        today = date.today()
        days_diff = (today - v).days

        if days_diff < 0:
            raise ValueError("Cannot log mood for future dates")
        if days_diff > 7:
            raise ValueError("Cannot log mood older than 7 days")

        return v


class MoodLogUpdate(BaseModel):
    """Schema for updating a mood log"""

    mood_score: Optional[int] = Field(
        None, ge=1, le=10, description="Mood score from 1 to 10"
    )
    notes: Optional[str] = Field(None, max_length=1000, description="Optional notes")


class MoodLogResponse(BaseModel):
    """Schema for mood log response"""

    id: str
    user_id: str
    log_date: date
    mood_score: int
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class StressLogCreate(BaseModel):
    """Schema for creating a stress log"""

    log_date: date
    stress_level: int = Field(..., ge=1, le=10, description="Stress level from 1 to 10")
    triggers: Optional[str] = Field(
        None, max_length=1000, description="Optional stress triggers"
    )
    notes: Optional[str] = Field(None, max_length=1000, description="Optional notes")

    @field_validator("log_date")
    @classmethod
    def validate_log_date(cls, v: date) -> date:
        """Validate log date is within last 7 days"""
        today = date.today()
        days_diff = (today - v).days

        if days_diff < 0:
            raise ValueError("Cannot log stress for future dates")
        if days_diff > 7:
            raise ValueError("Cannot log stress older than 7 days")

        return v


class StressLogUpdate(BaseModel):
    """Schema for updating a stress log"""

    stress_level: Optional[int] = Field(
        None, ge=1, le=10, description="Stress level from 1 to 10"
    )
    triggers: Optional[str] = Field(
        None, max_length=1000, description="Optional stress triggers"
    )
    notes: Optional[str] = Field(None, max_length=1000, description="Optional notes")


class StressLogResponse(BaseModel):
    """Schema for stress log response"""

    id: str
    user_id: str
    log_date: date
    stress_level: int
    triggers: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class SleepLogCreate(BaseModel):
    """Schema for creating a sleep log"""

    log_date: date
    duration_hours: float = Field(
        ..., gt=0, le=24, description="Sleep duration in hours"
    )
    quality_score: int = Field(
        ..., ge=1, le=10, description="Sleep quality from 1 to 10"
    )
    notes: Optional[str] = Field(None, max_length=1000, description="Optional notes")

    @field_validator("log_date")
    @classmethod
    def validate_log_date(cls, v: date) -> date:
        """Validate log date is within last 7 days"""
        today = date.today()
        days_diff = (today - v).days

        if days_diff < 0:
            raise ValueError("Cannot log sleep for future dates")
        if days_diff > 7:
            raise ValueError("Cannot log sleep older than 7 days")

        return v


class SleepLogUpdate(BaseModel):
    """Schema for updating a sleep log"""

    duration_hours: Optional[float] = Field(
        None, gt=0, le=24, description="Sleep duration in hours"
    )
    quality_score: Optional[int] = Field(
        None, ge=1, le=10, description="Sleep quality from 1 to 10"
    )
    notes: Optional[str] = Field(None, max_length=1000, description="Optional notes")


class SleepLogResponse(BaseModel):
    """Schema for sleep log response"""

    id: str
    user_id: str
    log_date: date
    duration_hours: float
    quality_score: int
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class WellnessLogsResponse(BaseModel):
    """Schema for combined wellness logs response"""

    mood_logs: list[MoodLogResponse] = []
    stress_logs: list[StressLogResponse] = []
    sleep_logs: list[SleepLogResponse] = []
    total_count: int


# --- Recommendation Schemas (BE-S2-008) ---


class RecommendationRequest(BaseModel):
    """Schema for recommendation request (BE-S2-005)."""

    user_id: str
    constraints: Optional[dict] = None


class RecommendationItem(BaseModel):
    """A single recommended menu item with score and short explanation."""

    model_config = ConfigDict(from_attributes=True)

    menu_item_id: str
    score: float
    explanation: str


class RecommendationResponse(BaseModel):
    """Schema for recommendation API responses (list of RecommendationItem)."""

    model_config = ConfigDict(from_attributes=True)

    user_id: Optional[str] = None
    recommendations: list[RecommendationItem] = []
