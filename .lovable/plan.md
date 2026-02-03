
# Add Back Button to Businesses Tab

## Overview

Add a back button to the left of the "Reset" button in the ClientBusinessesTab component.

---

## File to Modify

| File | Change |
|------|--------|
| `src/components/client-detail/ClientBusinessesTab.tsx` | Add ArrowLeft icon import and Back button |

---

## Change Details

### 1. Add ArrowLeft import (line 12)

```typescript
import { Pencil, Trash2, Plus, RotateCcw, Loader2, ArrowLeft } from "lucide-react";
```

### 2. Add useNavigate hook import (line 1)

```typescript
import { useParams, useNavigate } from "react-router-dom";
```

### 3. Add navigate hook in component (after line 16)

```typescript
const navigate = useNavigate();
```

### 4. Add Back button before Reset button (between lines 34-35)

```tsx
<Button variant="outline" className="gap-2" onClick={() => navigate(-1)}>
  <ArrowLeft className="w-4 h-4" />
  Back
</Button>
```

---

## Result

The action buttons row will show: **Add new** | **Back** | **Reset** | (spacer) | Search input

The Back button will navigate to the previous page in the browser history.
