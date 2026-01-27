# LIV8 OS Dashboard - GHL Custom Menu Integration

## Overview

The LIV8 OS Dashboard can be embedded directly inside GoHighLevel as a Custom Menu item. Users will see the intelligence dashboard without leaving GHL.

---

## Architecture

**Two Deployment Options:**

### Option A: Chrome Extension Side Panel (✅ Already Set Up)
- Stays open on the right side while navigating GHL
- Context-aware (knows current contact/opportunity)
- Best for: Quick actions and operator commands

### Option B: GHL Custom Menu (iframe) - Dashboard View
- Full intelligence dashboard inside GHL itself
- Accessed via custom menu item
- Best for: Analytics, forecasting, opportunities

**Both can coexist!** Extension for quick actions, Custom Menu for deep analytics.

---

## Setup: Add Dashboard to GHL Custom Menu

### Step 1: Deploy Dashboard Page

The dashboard needs to be accessible at a public URL.

**Using Vercel (Recommended):**

```bash
# Create standalone dashboard app
cd GHL-AGENTS
mkdir dashboard
cd dashboard
npm create vite@latest . -- --template react-ts
npm install

# Copy Dashboard.tsx and components
# Build and deploy to Vercel
vercel
```

Dashboard will be at: `https://your-dashboard.vercel.app` or `https://dashboard.liv8ai.com`

### Step 2: Configure for iframe Embedding

**Update dashboard to handle iframe:**

```typescript
// dashboard/src/App.tsx
import { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard';

function App() {
  const [locationId, setLocationId] = useState<string>('');
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    // Detect if running in iframe
    setIsInIframe(window.self !== window.top);

    // Listen for messages from GHL
    window.addEventListener('message', (event) => {
      // Verify origin
      if (event.origin.includes('gohighlevel.com')) {
        // GHL sends location context
        if (event.data.locationId) {
          setLocationId(event.data.locationId);
        }
      }
    });

    // Request location from parent (GHL)
    if (isInIframe) {
      window.parent.postMessage({ type: 'REQUEST_LOCATION' }, '*');
    }
  }, []);

  return <Dashboard locationId={locationId} />;
}

export default App;
```

**Update backend CORS to allow iframe:**

```typescript
// backend/src/index.ts
app.use(cors({
  origin: [
    'chrome-extension://*',
    'https://dashboard.liv8ai.com',
    'https://app.gohighlevel.com',
    'https://*.gohighlevel.com'
  ],
  credentials: true
}));

// Allow iframe embedding from GHL
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'ALLOW-FROM https://app.gohighlevel.com');
  res.setHeader('Content-Security-Policy', "frame-ancestors 'self' https://*.gohighlevel.com");
  next();
});
```

### Step 3: Add Custom Menu in GHL

**For Each Location:**

1. Go to **Settings** → **Custom Menu**
2. Click **Add Custom Menu**
3. Configure:
   - **Name**: `LIV8 Intelligence`
   - **Icon**: Choose AI/Analytics icon
   - **Type**: `iframe`
   - **URL**: `https://dashboard.liv8ai.com?locationId={{location.id}}`
   - **Open in**: `Main Window` (full width)
   - **Permissions**: All (for API access)

4. Click **Save**

**Custom Menu will appear in left sidebar!**

### Step 4: SSO Authentication (Optional but Recommended)

For seamless auth, use GHL's SSO:

```typescript
// Dashboard checks for GHL SSO token
const urlParams = new URLSearchParams(window.location.search);
const ghlSsoToken = urlParams.get('sso_token');

if (ghlSsoToken) {
  // Verify with GHL API
  // Exchange for LIV8 session token
  // Auto-login user
}
```

---

## URL Parameters GHL Provides

When GHL loads your Custom Menu iframe, it can pass:

```
https://dashboard.liv8ai.com?
  locationId={{location.id}}
  &companyId={{company.id}}
  &userId={{user.id}}
  &contactId={{contact.id}}  // if viewing contact
```

Use these to auto-configure the dashboard!

---

## Responsive Design for iframe

Ensure dashboard fits GHL's layout:

```css
/* Dashboard should be fluid width */
.dashboard-container {
  width: 100%;
  min-height: 100vh;
  padding: 1rem;
  box-sizing: border-box;
}

/* Adjust for GHL's typical iframe width (~1200px) */
@media (max-width: 1200px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## Communication Between iframe and GHL

**Send messages TO GHL:**
```typescript
window.parent.postMessage({
  type: 'LIV8_ACTION',
  action: 'open_contact',
  contactId: '12345'
}, 'https://app.gohighlevel.com');
```

**Receive messages FROM GHL:**
```typescript
window.addEventListener('message', (event) => {
  if (event.data.type === 'GHL_CONTEXT_UPDATE') {
    // User navigated to different page in GHL
    updateDashboardContext(event.data);
  }
});
```

---

## Deployment Checklist

- [ ] Create standalone dashboard app
- [ ] Configure iframe detection
- [ ] Update CORS headers on backend
- [ ] Set X-Frame-Options to allow GHL
- [ ] Deploy dashboard to Vercel
- [ ] Configure custom domain (dashboard.liv8ai.com)
- [ ] Add Custom Menu in GHL
- [ ] Test iframe loading
- [ ] Test postMessage communication
- [ ] Implement SSO (optional)

---

## Benefits of Custom Menu Approach

✅ **Zero Context Switching** - Users stay in GHL
✅ **Native Feel** - Appears as part of GHL UI
✅ **Auto Context** - GHL passes location/contact info
✅ **Full Width** - More screen real estate than side panel
✅ **White Label** - Your branding inside GHL

---

## Comparison

| Feature | Chrome Extension | GHL Custom Menu |
|---------|-----------------|-----------------|
| **Access** | Side panel (right) | Left menu item |
| **Width** | ~400px | Full width |
| **Context** | Auto-detected | Passed by GHL |
| **Best For** | Quick actions | Analytics/Dashboard |
| **Install** | Chrome Web Store | Admin adds to location |
| **Auth** | Separate login | GHL SSO possible |

**Recommendation:** Use BOTH for best experience!

---

## Next Steps

1. I'll create the standalone dashboard deployment
2. Configure iframe compatibility
3. Update backend CORS
4. Provide step-by-step GHL Custom Menu setup

Want me to build the standalone dashboard deployment now?
