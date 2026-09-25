# 🔌 EduBari School ERP — Subscription Connect Guide

> **For Laravel / PHP Developers**  
> This document explains how to connect your School ERP (Laravel/Blade) to the EduBari Central Subscription System.

---

## 📋 Overview

EduBari Central manages your school's subscription plan, feature limits, and AI credits. Your Laravel ERP must call the EduBari Verification API on boot to:

1. ✅ Confirm your subscription is active
2. 📊 Retrieve plan limits (students, teachers, AI credits, features)
3. 🔐 Enforce feature gates in your Laravel middleware

---

## 🔑 Prerequisites

- You must have an active **School ERP** subscription in EduBari Admin Panel
- Your admin will provide you with:
  - `ERP_API_TOKEN` — unique 64-character hex token
  - `ERP_API_SECRET` — unique 64-character hex secret
  - `EDUBARI_API_URL` — the central EduBari server URL

---

## ⚙️ Step 1: Configure `.env`

Add the following to your Laravel `.env` file:

```env
EDUBARI_API_URL=https://edubari.bd
ERP_API_TOKEN=your_64_char_token_here
ERP_API_SECRET=your_64_char_secret_here
ERP_CACHE_MINUTES=60
```

---

## 📦 Step 2: Create the EduBari Service

Create `app/Services/EduBariSubscriptionService.php`:

```php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class EduBariSubscriptionService
{
    protected string $apiUrl;
    protected string $token;
    protected string $secret;
    protected int $cacheMinutes;

    public function __construct()
    {
        $this->apiUrl      = rtrim(config('edubari.api_url'), '/');
        $this->token       = config('edubari.api_token');
        $this->secret      = config('edubari.api_secret');
        $this->cacheMinutes = (int) config('edubari.cache_minutes', 60);
    }

    /**
     * Verify domain and get subscription data.
     * Cached for $cacheMinutes to reduce API calls.
     */
    public function verify(): array
    {
        return Cache::remember('edubari_subscription', $this->cacheMinutes * 60, function () {
            $response = Http::timeout(10)->get("{$this->apiUrl}/api/erp/verify-domain", [
                'token'  => $this->token,
                'secret' => $this->secret,
            ]);

            if ($response->failed()) {
                return [
                    'active' => false,
                    'status' => 'api_error',
                    'plan'   => null,
                ];
            }

            return $response->json();
        });
    }

    /**
     * Get a specific plan limit.
     */
    public function getLimit(string $key, mixed $default = 0): mixed
    {
        $data = $this->verify();
        return $data['plan'][$key] ?? $default;
    }

    /**
     * Check if a feature gate is enabled.
     */
    public function hasFeature(string $feature): bool
    {
        $data = $this->verify();
        return (bool) ($data['plan']['feature_gates'][$feature] ?? false);
    }

    /**
     * Check if the subscription is currently active.
     */
    public function isActive(): bool
    {
        $data = $this->verify();
        return (bool) ($data['active'] ?? false);
    }

    /**
     * Send a heartbeat ping to EduBari Central (call from a scheduled job).
     */
    public function ping(): void
    {
        try {
            Http::timeout(5)->post("{$this->apiUrl}/api/erp/ping", [
                'token'           => $this->token,
                'laravel_version' => app()->version(),
                'erp_version'     => config('app.erp_version', '1.0.0'),
            ]);
        } catch (\Exception $e) {
            // Non-blocking — just log
            logger()->warning('EduBari ping failed: ' . $e->getMessage());
        }
    }
}
```

---

## ⚙️ Step 3: Create Config File

Create `config/edubari.php`:

```php
<?php

return [
    'api_url'       => env('EDUBARI_API_URL', 'https://edubari.bd'),
    'api_token'     => env('ERP_API_TOKEN'),
    'api_secret'    => env('ERP_API_SECRET'),
    'cache_minutes' => env('ERP_CACHE_MINUTES', 60),
];
```

---

## 🛡️ Step 4: Create Subscription Middleware

Create `app/Http/Middleware/CheckErpSubscription.php`:

```php
<?php

namespace App\Http\Middleware;

use App\Services\EduBariSubscriptionService;
use Closure;
use Illuminate\Http\Request;

class CheckErpSubscription
{
    public function __construct(protected EduBariSubscriptionService $edubari) {}

    public function handle(Request $request, Closure $next)
    {
        if (!$this->edubari->isActive()) {
            if ($request->expectsJson()) {
                return response()->json([
                    'error' => 'Subscription expired or suspended. Contact EduBari support.'
                ], 403);
            }
            return redirect()->route('subscription.expired');
        }

        // Share subscription data with all views
        $data = $this->edubari->verify();
        view()->share('erpSubscription', $data);

        return $next($request);
    }
}
```

Register in `bootstrap/app.php` (Laravel 11+):

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'erp.subscription' => \App\Http\Middleware\CheckErpSubscription::class,
    ]);
})
```

Apply to your routes in `routes/web.php`:

```php
Route::middleware(['auth', 'erp.subscription'])->group(function () {
    // All your protected ERP routes here
    Route::get('/dashboard', [DashboardController::class, 'index']);
    // ...
});
```

---

## 📊 Step 5: Use Plan Limits in Controllers

```php
use App\Services\EduBariSubscriptionService;

class StudentController extends Controller
{
    public function __construct(protected EduBariSubscriptionService $edubari) {}

    public function store(Request $request)
    {
        $maxStudents = $this->edubari->getLimit('max_students', 50);
        $currentCount = Student::count();

        if ($currentCount >= $maxStudents) {
            return back()->withErrors([
                'limit' => "Student limit reached ({$maxStudents}). Upgrade your EduBari plan."
            ]);
        }

        // proceed with storing student...
    }
}
```

---

## 🔒 Step 6: Feature Gate Usage

```php
// In a controller
if (!$this->edubari->hasFeature('ai_presentation')) {
    abort(403, 'AI Presentation Maker requires an upgraded plan.');
}

// In a Blade template
@if($erpSubscription['plan']['feature_gates']['guardian_portal'] ?? false)
    <a href="{{ route('guardian.portal') }}">Guardian Portal</a>
@endif
```

---

## ⏰ Step 7: Schedule Heartbeat Ping

In `routes/console.php` (Laravel 11+):

```php
use App\Services\EduBariSubscriptionService;
use Illuminate\Support\Facades\Schedule;

Schedule::call(function () {
    app(EduBariSubscriptionService::class)->ping();
})->hourly()->name('edubari-ping');
```

This keeps your ERP's **Last Ping** timestamp up-to-date in the EduBari Admin Dashboard.

---

## 📡 API Response Reference

### `GET /api/erp/verify-domain?token=xxx&secret=yyy`

**Success Response (200):**
```json
{
  "active": true,
  "status": "active",
  "domain": "yourschool.edubari.bd",
  "client_name": "Your School Name",
  "client_type": "school_erp",
  "plan": {
    "id": "uuid",
    "name": "EDUBARI Business",
    "tier": "business",
    "type": "school_erp",
    "max_students": 500,
    "max_teachers": 10,
    "max_batches": 30,
    "monthly_ai_credits": 30,
    "show_branding": false,
    "feature_gates": {
      "multi_teacher": true,
      "guardian_portal": true,
      "ai_presentation": true,
      "advanced_analytics": true,
      "salary_management": true
    },
    "price": 550.00,
    "duration_days": 30
  },
  "subscription": {
    "start_date": "2026-01-01T00:00:00.000Z",
    "end_date": "2026-02-01T00:00:00.000Z",
    "grace_end_date": "2026-02-08T00:00:00.000Z",
    "payment_status": "paid",
    "days_remaining": 6
  },
  "verified_at": "2026-09-26T00:00:00.000Z"
}
```

**Subscription Statuses:**
| Status | Meaning |
|--------|---------|
| `active` | Fully operational |
| `grace_period` | Expired but within 7-day grace — access still allowed |
| `expired` | Grace period ended — block access |
| `suspended` | Admin manually suspended — block access |
| `no_subscription` | No plan assigned |

---

## 🚨 Troubleshooting

| Error | Solution |
|-------|---------|
| `401 Missing API token` | Check `ERP_API_TOKEN` in `.env` |
| `403 Invalid API token` | Token is wrong or doesn't exist — contact EduBari admin |
| `403 Suspended` | Your ERP instance has been suspended |
| `500 Internal Server Error` | EduBari server issue — retry after a few minutes |
| Cache not refreshing | Run `php artisan cache:clear` then reload |

---

## 📞 Support

Contact EduBari Admin: **botbari@edubari.bd**  
Admin Panel: **https://edubari.bd/admin**
