

## Reset Password for User

### Approach
Create a one-time edge function that uses the admin API to update the password for `nico@advizorstack.com` to `12Eqwme@dwqd1!`.

### Steps

1. **Create edge function** `reset-user-password/index.ts` that:
   - Uses the service role key to call `supabase.auth.admin.updateUserById()`
   - Looks up the user by email, then updates their password
   - Returns success/failure response

2. **Deploy and invoke** the function once to apply the password change

3. **Clean up** by deleting the edge function after use (it's a one-time operation)

### Technical Details

The edge function will:
```
- Look up user by email via admin.listUsers() filter
- Call admin.updateUserById(userId, { password: "12Eqwme@dwqd1!" })
- Return confirmation
```

No database migrations or UI changes required.

