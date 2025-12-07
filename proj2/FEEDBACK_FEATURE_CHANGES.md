# AI Feedback Loop & Personalization Feature - Changes Summary

## Overview
This document summarizes all changes made to implement Week 5 — v1.1 (AI Feedback Loop & Personalization) feature, which adds like/dislike feedback functionality to the recommendation system.

## Files Changed

### Backend Changes

#### 1. Database Model (`backend/src/eatsential/models/models.py`)
- **Added**: `FeedbackType` enum (LIKE, DISLIKE)
- **Added**: `RecommendationFeedbackDB` model with fields:
  - `id`, `user_id`, `item_id`, `item_type`, `feedback_type`
  - `notes` (optional), `created_at`, `updated_at`
- **Added**: Relationship from `UserDB` to `RecommendationFeedbackDB`

#### 2. Database Migration (`backend/alembic/versions/013_add_recommendation_feedback_table.py`)
- **New file**: Creates `recommendation_feedback` table
- Includes indexes on: `user_id`, `item_id`, `item_type`, `feedback_type`, `created_at`
- Foreign key constraint to `users` table with CASCADE delete

#### 3. Alembic Configuration (`backend/alembic/env.py`)
- **Updated**: Added `RecommendationFeedbackDB` import for autogenerate support

#### 4. Models Export (`backend/src/eatsential/models/__init__.py`)
- **Added**: Exports for `FeedbackType` and `RecommendationFeedbackDB`

#### 5. API Schemas (`backend/src/eatsential/schemas/recommendation_schemas.py`)
- **Added**: `FeedbackRequest` schema:
  - `item_id`: string (required)
  - `item_type`: "meal" | "restaurant" (required)
  - `feedback_type`: "like" | "dislike" (required)
  - `notes`: string (optional)
- **Added**: `FeedbackResponse` schema with feedback record details

#### 6. Feedback Service (`backend/src/eatsential/services/feedback_service.py`)
- **New file**: `FeedbackService` class with methods:
  - `submit_feedback()`: Creates or updates feedback records
  - `get_user_disliked_items()`: Returns set of disliked item IDs
  - `get_user_liked_items()`: Returns set of liked item IDs

#### 7. Recommendation Engine (`backend/src/eatsential/services/engine.py`)
- **Updated**: `get_meal_recommendations()`:
  - Filters out disliked items before ranking
  - Boosts scores for liked items (10% increase)
- **Updated**: `get_restaurant_recommendations()`:
  - Filters out disliked restaurants
  - Boosts scores for liked restaurants
- **Added**: `_apply_feedback_boosts()` helper method

#### 8. API Router (`backend/src/eatsential/routers/recommend.py`)
- **Added**: `POST /api/recommend/feedback` endpoint
- Imports `FeedbackService`, `FeedbackRequest`, `FeedbackResponse`

### Frontend Changes

#### 1. API Client (`frontend/src/lib/api.ts`)
- **Added**: `FeedbackRequest` interface
- **Added**: `FeedbackResponse` interface
- **Added**: `recommendationApi.submitFeedback()` method

#### 2. Recommendation Carousel Component (`frontend/src/components/recommendations/RecommendationCarousel.tsx`)
- **Added**: Import for `ThumbsUp`, `ThumbsDown` icons from lucide-react
- **Added**: Import for `recommendationApi` from `@/lib/api`
- **Added**: `feedbackLoading` state to track loading per item
- **Added**: `handleFeedback()` function to submit feedback
- **Added**: Like/Dislike buttons in each recommendation card:
  - Green "Like" button with ThumbsUp icon
  - Red "Dislike" button with ThumbsDown icon
  - Loading states during submission
  - Disabled state while processing

## Statistics

- **Total files changed**: 10 files
- **New files**: 2 (migration, feedback_service)
- **Lines added**: ~287
- **Lines removed**: ~10

## Key Features Implemented

1. ✅ **Like/Dislike Feedback API**: Users can submit feedback on recommendations
2. ✅ **Persistent Storage**: Feedback stored in database with user association
3. ✅ **Recommendation Filtering**: Disliked items automatically excluded from future recommendations
4. ✅ **Score Boosting**: Liked items receive 10% score boost in future recommendations
5. ✅ **UI Integration**: Like/Dislike buttons added to recommendation cards
6. ✅ **Feedback Loop**: System learns from user preferences over time

## Database Schema

```sql
CREATE TABLE recommendation_feedback (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    item_id VARCHAR NOT NULL,
    item_type VARCHAR(20) NOT NULL,
    feedback_type VARCHAR(20) NOT NULL,
    notes TEXT,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX ix_recommendation_feedback_user_id ON recommendation_feedback(user_id);
CREATE INDEX ix_recommendation_feedback_item_id ON recommendation_feedback(item_id);
CREATE INDEX ix_recommendation_feedback_item_type ON recommendation_feedback(item_type);
CREATE INDEX ix_recommendation_feedback_feedback_type ON recommendation_feedback(feedback_type);
CREATE INDEX ix_recommendation_feedback_created_at ON recommendation_feedback(created_at);
```

## API Endpoints

### POST /api/recommend/feedback
**Request Body:**
```json
{
  "item_id": "menu-item-uuid",
  "item_type": "meal",
  "feedback_type": "like",
  "notes": "Optional feedback notes"
}
```

**Response:**
```json
{
  "id": "feedback-uuid",
  "item_id": "menu-item-uuid",
  "item_type": "meal",
  "feedback_type": "like",
  "created_at": "2025-01-XX..."
}
```

## How It Works

1. **User Interaction**: User clicks Like/Dislike on a recommendation card
2. **API Call**: Frontend sends feedback to `/api/recommend/feedback`
3. **Storage**: Backend stores/updates feedback in database
4. **Future Recommendations**: 
   - Disliked items are filtered out before ranking
   - Liked items receive score boost (10% increase)
   - System adapts to user preferences over time

## Testing the Feature

1. Run database migration:
   ```bash
   cd backend
   uv run alembic upgrade head
   ```

2. Start the application:
   ```bash
   bun dev
   ```

3. Navigate to recommendations page
4. Click Like/Dislike on any recommendation
5. Request new recommendations - disliked items should be filtered out
6. Liked items should appear with boosted scores

