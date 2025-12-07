# How to Set Up Gemini API Keys

## Overview

The Eatsential application uses Google's Gemini AI for intelligent meal and restaurant recommendations. To enable AI-powered recommendations, you need to set up your Gemini API key.

## Step-by-Step Instructions

### 1. Get a Gemini API Key

1. **Go to Google AI Studio**
   - Visit: https://aistudio.google.com/
   - Sign in with your Google account

2. **Create an API Key**
   - Click on "Get API Key" in the left sidebar
   - Click "Create API Key" 
   - Choose to create a new Google Cloud project or use an existing one
   - Copy the generated API key (you'll need this in the next step)

### 2. Configure the Backend .env File

1. **Navigate to the backend directory**
   ```bash
   cd proj2/backend
   ```

2. **Check if .env file exists**
   ```bash
   ls -la .env
   ```

3. **If .env doesn't exist, create it from the example**
   ```bash
   cp .env.example .env
   ```

4. **Edit the .env file**
   ```bash
   # Using nano editor
   nano .env
   
   # Or using vim
   vim .env
   
   # Or using VS Code
   code .env
   ```

5. **Add your Gemini API key**
   
   Add or update these lines in your `.env` file:
   ```env
   # Gemini AI Configuration
   GEMINI_API_KEY=your-api-key-here
   GEMINI_MODEL=gemini-2.5-flash
   GEMINI_TEMPERATURE=0.2
   ```

   Replace `your-api-key-here` with the actual API key you copied from Google AI Studio.

### 3. Example .env File

Here's what a complete `.env` file might look like:

```env
# Database Configuration
DATABASE_URL=sqlite:///./eatsential.db
ENVIRONMENT=development

# JWT Secret (generate a secure random string)
JWT_SECRET_KEY=your-secret-key-here

# Gemini AI Configuration
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
GEMINI_MODEL=gemini-2.5-flash
GEMINI_TEMPERATURE=0.2
```

### 4. Verify the Configuration

The application will automatically read these environment variables. You can verify they're being loaded by:

1. **Check the application logs** when starting the backend
2. **Test the recommendation endpoint** - if the API key is missing, you'll see errors in the logs
3. **Check the API documentation** at http://localhost:8000/docs

### 5. Environment Variables Explained

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `GEMINI_API_KEY` | Your Google Gemini API key | None | ✅ Yes |
| `GEMINI_MODEL` | Gemini model to use | `gemini-2.5-flash` | No |
| `GEMINI_TEMPERATURE` | Temperature for AI responses (0.0-1.0) | `0.2` | No |

### 6. Security Best Practices

⚠️ **Important Security Notes:**

1. **Never commit .env to git** - The `.env` file should already be in `.gitignore`
2. **Keep your API key secret** - Don't share it publicly or in screenshots
3. **Use different keys for development/production** - Create separate API keys for different environments
4. **Set usage limits** - In Google Cloud Console, set usage limits to prevent unexpected charges

### 7. Testing Without API Key

If you don't have a Gemini API key yet, the application will still work but will:
- Fall back to baseline (non-AI) recommendations
- Show warnings in the logs about missing API key
- Still allow you to test the feedback feature

### 8. Troubleshooting

**Problem: "LLM API key is not configured"**
- Solution: Make sure `GEMINI_API_KEY` is set in your `.env` file
- Solution: Restart the backend server after adding the key

**Problem: "Invalid API key"**
- Solution: Verify the key is correct (no extra spaces)
- Solution: Check if the key is active in Google AI Studio
- Solution: Make sure you're using the correct project's API key

**Problem: API rate limits**
- Solution: Check your quota in Google Cloud Console
- Solution: The application will fall back to baseline recommendations if API fails

### 9. Quick Setup Script

You can also set the API key directly via command line:

```bash
# Add to .env file
echo "GEMINI_API_KEY=your-key-here" >> proj2/backend/.env
```

Or export it for the current session:

```bash
export GEMINI_API_KEY=your-key-here
```

## Next Steps

After setting up the API key:

1. **Restart the backend server** if it's already running
2. **Test the recommendations** - Try getting meal recommendations
3. **Check the logs** - Verify there are no API key errors
4. **Test the feedback feature** - Like/dislike recommendations to see the AI adapt

## Additional Resources

- [Google AI Studio](https://aistudio.google.com/) - Get your API key
- [Gemini API Documentation](https://ai.google.dev/docs) - API reference
- [Project README](../README.md) - General setup instructions

