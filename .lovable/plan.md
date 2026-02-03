

# Wait for User Name Before Starting Typewriter Animation

## Problem

Currently, the typewriter animation triggers twice:
1. First when the page loads with `userName = ""` → types "Good Evening"
2. Again when `userName` loads from the database → erases and types "Good Evening, Emile"

The user wants the animation to only run once, after the user's name has been fetched.

## Solution

Add a loading state to track when the profile fetch is complete, and only start the typewriter animation after the name is available.

## Technical Approach

### 1. Add a Loading State

Track whether the profile has been fetched:
```typescript
const [isProfileLoaded, setIsProfileLoaded] = useState(false);
```

### 2. Update Profile Fetch Effect

Set the loading state to `true` after the fetch completes (whether or not a name was found):
```typescript
useEffect(() => {
  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("user_id", user.id)
        .single();
      if (data?.first_name) {
        setUserName(data.first_name);
      }
    }
    setIsProfileLoaded(true); // Always set after fetch attempt
  };
  fetchProfile();
}, []);
```

### 3. Update Typewriter Effect to Wait for Profile

Only start typing when profile is loaded:
```typescript
useEffect(() => {
  // Don't start until profile is loaded
  if (!isProfileLoaded) return;
  
  const greeting = getGreeting(timeOfDay);
  const fullText = userName ? `${greeting}, ${userName}` : greeting;
  
  // ... rest of typewriter logic
}, [userName, timeOfDay, isProfileLoaded]);
```

## Animation Flow (After Fix)

```text
1. Page loads → Nothing displayed (waiting for profile)
2. Profile fetch completes → userName = "Emile"
3. Greeting starts typing → "G", "Go", "Goo"... "Good Evening, Emile"
4. Greeting completes → Subtitle starts typing
5. Subtitle completes → All animations done
```

## Summary of Changes

| File | Location | Change |
|------|----------|--------|
| `src/pages/AIAssistant.tsx` | Line 97 | Add `isProfileLoaded` state initialized to `false` |
| `src/pages/AIAssistant.tsx` | Lines 138-153 | Add `setIsProfileLoaded(true)` after fetch completes |
| `src/pages/AIAssistant.tsx` | Lines 164-184 | Add early return if `!isProfileLoaded`, add to dependency array |

