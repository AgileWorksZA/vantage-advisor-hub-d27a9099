

## Add Notifications to Seed Sequence

Simple addition: add `seed-notifications` to the existing seed sequence array and add a dedicated "Seed Notifications" button alongside the existing Calendar/Tasks buttons.

### Changes — `src/components/administration/system/SystemSettingsSection.tsx`

1. **Add to `seedSequence` array** (after `seed-tlh-clients`):
   ```ts
   { name: "seed-notifications", label: "Notifications" },
   ```

2. **Add state** for a standalone seed button:
   ```ts
   const [seedingNotifications, setSeedingNotifications] = useState(false);
   ```

3. **Add `handleSeedNotifications`** handler (same pattern as `handleSeedCalendar`/`handleSeedOpenTasks`) calling `seed-notifications`.

4. **Add button** in the button row next to "Seed Open Tasks":
   ```tsx
   <Button variant="outline" size="sm" onClick={handleSeedNotifications} disabled={seedingNotifications || seedingAll}>
     {seedingNotifications ? <Loader2 .../> : <Bell .../>}
     {seedingNotifications ? "Seeding Notifications..." : "Seed Notifications"}
   </Button>
   ```

One file changed. No database or config changes needed (`seed-notifications` is already registered in `config.toml`).

