

## Reset Password in Production

### Approach
Re-create the same one-time `reset-user-password` edge function, deploy it, and invoke it against the **Live** environment to update the password for `nico@advizorstack.com` to `12Eqwme@dwqd1!`.

### Steps

1. **Re-create** `supabase/functions/reset-user-password/index.ts` (same code as before)
2. **Add** `verify_jwt = false` entry in `supabase/config.toml`
3. **Deploy** the function
4. **Invoke** it against the **production** environment
5. **Clean up** -- delete the function and revert config.toml

### Technical Notes
- The function uses the Service Role key (available in both environments) to call `auth.admin.updateUserById()`
- The curl call will target the production environment to ensure the Live auth database is updated
- Same cleanup process as before

