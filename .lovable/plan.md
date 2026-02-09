

## Remove User nico@advizorstack.com

### Approach
Create a temporary edge function that uses the Admin Auth API to delete the user `nico@advizorstack.com` and their associated data from both Test and Production environments.

### Steps

1. **Create edge function** `delete-user/index.ts` that:
   - Looks up user by email via `admin.listUsers()`
   - Deletes related records from `user_jurisdictions`, `profiles`, and `clients` tables
   - Calls `auth.admin.deleteUser(userId)` to remove the auth record
   - Returns confirmation

2. **Deploy and invoke** against Test environment

3. **Invoke again** against Production environment

4. **Clean up** -- delete the function and revert config.toml

### Technical Details

The function will:
- Find the user ID by email
- Delete from `user_jurisdictions` where `user_id` matches
- Delete from `profiles` where `id` matches
- Delete seeded `clients` where `user_id` matches
- Call `auth.admin.deleteUser(userId)` to fully remove the user
- Uses service role key to bypass RLS

Single file change: `supabase/functions/delete-user/index.ts` (temporary) and a temporary config.toml entry.

