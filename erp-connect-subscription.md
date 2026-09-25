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

## 🖥️ Step 8: Add Subscription Menu & Payment UI in Laravel ERP Admin Panel

Add the Subscription management menu at the **very bottom** of your Laravel ERP Admin Panel sidebar. This allows school admins to view remaining days, monitor feature limits, and directly buy or renew subscriptions via bKash / Nagad.

---

### 1️⃣ Add Route & Controller

Create `app/Http/Controllers/Admin/SubscriptionController.php`:

```php
<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\EduBariSubscriptionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Student;
use App\Models\Teacher;

class SubscriptionController extends Controller
{
    public function __construct(protected EduBariSubscriptionService $edubari) {}

    /**
     * Show Subscription Dashboard for School Admin
     */
    public function index()
    {
        $subscriptionData = $this->edubari->verify();
        
        // Count actual active users in local database for usage tracking
        $currentStudents = Student::count();
        $currentTeachers = Teacher::count();

        return view('admin.subscription.index', [
            'sub'             => $subscriptionData['subscription'] ?? null,
            'plan'            => $subscriptionData['plan'] ?? null,
            'active'          => $subscriptionData['active'] ?? false,
            'status'          => $subscriptionData['status'] ?? 'unknown',
            'clientName'      => $subscriptionData['client_name'] ?? config('app.name'),
            'currentStudents' => $currentStudents,
            'currentTeachers' => $currentTeachers,
        ]);
    }

    /**
     * Submit Renewal / Upgrade Payment TrxID to EduBari Central
     */
    public function submitPayment(Request $request)
    {
        $validated = $request->validate([
            'plan_name'      => 'required|string',
            'duration_months'=> 'required|numeric|min:1',
            'price'          => 'required|numeric',
            'payment_method' => 'required|string|in:bkash,nagad,rocket,bank',
            'transaction_id' => 'required|string|min:6|max:64',
            'phone'          => 'required|string',
        ]);

        $apiUrl = rtrim(config('edubari.api_url'), '/');

        // Post request to EduBari Central Verification Gateway
        $response = Http::post("{$apiUrl}/api/subscriptions", [
            'institutionName'      => config('app.name'),
            'phone'                => $validated['phone'],
            'paymentMethod'        => $validated['payment_method'],
            'transactionId'        => $validated['transaction_id'],
            'selectedPlanName'     => $validated['plan_name'],
            'selectedPlanDuration' => $validated['duration_months'],
            'selectedPlanPrice'    => $validated['price'],
            'preferredDomain'      => request()->getHost(),
        ]);

        if ($response->successful()) {
            return back()->with('success', 'আপনার সাবস্ক্রিপশন পেমেন্ট রিকোয়েস্ট সফলভাবে জমা হয়েছে! EduBari টীম যাচাই করে কয়েক মিনিটের মধ্যে সচল করে দিবে।');
        }

        return back()->withErrors(['payment' => 'পেমেন্ট জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন বা সরাসরি কাস্টমার কেয়ারে কল করুন।']);
    }
}
```

---

### 2️⃣ Create Sidebar Menu Entry (Bottom of Menu)

In your admin sidebar Blade component (e.g. `resources/views/layouts/sidebar.blade.php`), append at the **very bottom**:

```html
<!-- Bottom Sidebar Item: Subscription -->
<li class="mt-auto pt-4 border-t border-slate-700">
    <a href="{{ route('admin.subscription.index') }}" 
       class="flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-colors {{ request()->routeIs('admin.subscription.*') ? 'bg-indigo-600 text-white font-semibold' : '' }}">
        <div class="flex items-center gap-3">
            <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
            </svg>
            <span>School ERP Subscription</span>
        </div>
        
        @if(isset($erpSubscription['subscription']['days_remaining']))
            @php $days = $erpSubscription['subscription']['days_remaining']; @endphp
            <span class="px-2 py-0.5 text-xs font-bold rounded-full {{ $days > 7 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : ($days > 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30') }}">
                {{ $days > 0 ? $days . ' Days' : 'Expired' }}
            </span>
        @endif
    </a>
</li>
```

---

### 3️⃣ Create Subscription Dashboard & bKash Payment View

Create `resources/views/admin/subscription/index.blade.php`:

```html
@extends('layouts.admin')

@section('content')
<div class="p-6 max-w-7xl mx-auto space-y-8">
    
    <!-- Top Header Banner -->
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
            <div class="flex items-center gap-3">
                <h1 class="text-2xl font-bold text-white">EduBari ERP Subscription Status</h1>
                <span class="px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider 
                    {{ $status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 
                      ($status === 'grace_period' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40') }}">
                    ● {{ strtoupper($status) }}
                </span>
            </div>
            <p class="text-slate-400 text-sm mt-1">কাস্টমার অ্যাকাউন্ট: <strong class="text-white">{{ $clientName }}</strong></p>
        </div>

        @if(!$active || ($sub['days_remaining'] ?? 0) <= 7)
            <a href="#payment-modal" onclick="document.getElementById('renew-modal').classList.remove('hidden')" class="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Buy / Renew Subscription (bKash)
            </a>
        @endif
    </div>

    <!-- Alert Banner if Expiring or Expired -->
    @if(($sub['days_remaining'] ?? 0) <= 7)
        <div class="p-4 rounded-xl {{ ($sub['days_remaining'] ?? 0) <= 0 ? 'bg-rose-950/80 border border-rose-800 text-rose-200' : 'bg-amber-950/80 border border-amber-800 text-amber-200' }} flex items-center justify-between">
            <div class="flex items-center gap-3">
                <svg class="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                <span>
                    @if(($sub['days_remaining'] ?? 0) <= 0)
                        <strong>সাবস্ক্রিপশনের মেয়াদ শেষ হয়ে গেছে!</strong> দ্রুত রিনিউ না করলে আপনার ERP অ্যাকাউন্ট লক হয়ে যাবে।
                    @else
                        <strong>সাবস্ক্রিপশনের মেয়াদ শেষের পথে!</strong> আর মাত্র <strong>{{ $sub['days_remaining'] }} দিন</strong> বাকি আছে।
                    @endif
                </span>
            </div>
            <button onclick="document.getElementById('renew-modal').classList.remove('hidden')" class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-semibold transition">
                এখনই বিকাশ দিয়ে রিনিউ করুন
            </button>
        </div>
    @endif

    <!-- Main Grid Metrics & Usage -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        <!-- Days Remaining -->
        <div class="bg-slate-900 p-6 rounded-2xl border border-slate-800 relative overflow-hidden">
            <div class="text-xs uppercase font-bold text-slate-400 tracking-wider">মেয়াদ বাকি</div>
            <div class="text-4xl font-extrabold text-white mt-2">
                {{ $sub['days_remaining'] ?? 0 }} <span class="text-lg font-normal text-slate-400">দিন</span>
            </div>
            <p class="text-xs text-slate-500 mt-2">মেয়াদ শেষ: {{ isset($sub['end_date']) ? \Carbon\Carbon::parse($sub['end_date'])->format('d M, Y') : 'N/A' }}</p>
        </div>

        <!-- Current Plan -->
        <div class="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <div class="text-xs uppercase font-bold text-slate-400 tracking-wider">বর্তমান প্যাকেজ</div>
            <div class="text-2xl font-bold text-amber-400 mt-2">{{ $plan['name'] ?? 'No Plan' }}</div>
            <p class="text-xs text-slate-500 mt-2">মূল্য: ৳{{ number_format($plan['price'] ?? 0) }} / মাস</p>
        </div>

        <!-- Student Usage Meter -->
        <div class="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <div class="flex justify-between items-center text-xs uppercase font-bold text-slate-400 tracking-wider">
                <span>ছাত্র/ছাত্রী সীমা</span>
                <span>{{ $currentStudents }} / {{ $plan['max_students'] ?? 0 }}</span>
            </div>
            <div class="w-full bg-slate-800 h-3 rounded-full mt-3 overflow-hidden">
                @php $studentPct = min(100, round(($currentStudents / max(1, $plan['max_students'] ?? 1)) * 100)); @endphp
                <div class="bg-indigo-500 h-full rounded-full" style="width: {{ $studentPct }}%"></div>
            </div>
            <p class="text-xs text-slate-500 mt-2">{{ $studentPct }}% ব্যবহৃত হয়েছে</p>
        </div>

        <!-- Teacher Usage Meter -->
        <div class="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <div class="flex justify-between items-center text-xs uppercase font-bold text-slate-400 tracking-wider">
                <span>শিক্ষক সীমা</span>
                <span>{{ $currentTeachers }} / {{ $plan['max_teachers'] ?? 0 }}</span>
            </div>
            <div class="w-full bg-slate-800 h-3 rounded-full mt-3 overflow-hidden">
                @php $teacherPct = min(100, round(($currentTeachers / max(1, $plan['max_teachers'] ?? 1)) * 100)); @endphp
                <div class="bg-teal-500 h-full rounded-full" style="width: {{ $teacherPct }}%"></div>
            </div>
            <p class="text-xs text-slate-500 mt-2">{{ $teacherPct }}% ব্যবহৃত হয়েছে</p>
        </div>

    </div>

    <!-- Active Features Gate Status -->
    <div class="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <h2 class="text-lg font-bold text-white mb-4">প্যাকেজের অন্তর্ভুক্ত সকল ফিচারসমুহ</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            @foreach(['multi_teacher' => 'মাল্টি-টিচার সাপোর্ট', 'guardian_portal' => 'গার্ডিয়ান পোর্টাল & SMS', 'ai_presentation' => 'AI প্রেজентেশন মেকার', 'salary_management' => 'স্যালারি ও পে-রোল'] as $key => $label)
                <div class="p-4 rounded-xl border {{ ($plan['feature_gates'][$key] ?? false) ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300' : 'bg-slate-800/50 border-slate-800 text-slate-500' }} flex items-center gap-3">
                    <span class="text-lg">{{ ($plan['feature_gates'][$key] ?? false) ? '✅' : '🔒' }}</span>
                    <span class="text-sm font-semibold">{{ $label }}</span>
                </div>
            @endforeach
        </div>
    </div>

    <!-- bKash / Payment Renewal Modal -->
    <div id="renew-modal" class="hidden fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 relative">
            <button onclick="document.getElementById('renew-modal').classList.add('hidden')" class="absolute top-4 right-4 text-slate-400 hover:text-white text-xl">✕</button>
            
            <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 bg-pink-600 text-white flex items-center justify-center font-black rounded-xl text-xl">bKash</div>
                <div>
                    <h3 class="text-xl font-bold text-white">Buy / Renew ERP Subscription</h3>
                    <p class="text-xs text-slate-400">bKash Merchant / Personal পেমেন্ট সম্পূর্ণ করে TrxID ইনপুট দিন</p>
                </div>
            </div>

            <!-- Payment Steps Instruction Box -->
            <div class="bg-pink-950/30 border border-pink-800/50 p-4 rounded-xl mb-6 text-xs text-pink-200 space-y-1">
                <p><strong>১. bKash App থেকে Send Money / Make Payment করুন:</strong></p>
                <p class="text-base font-extrabold text-pink-400">01700-000000 (Merchant / Personal)</p>
                <p>২. নির্বাচিত প্যাকেজের টাকা পাঠানোর পর প্রেরিত <strong>TrxID</strong> সংগ্রহ করুন।</p>
            </div>

            <form action="{{ route('admin.subscription.payment') }}" method="POST" class="space-y-4">
                @csrf
                <div>
                    <label class="block text-xs font-semibold text-slate-300 mb-1">প্যাকেজ নির্বাচন করুন</label>
                    <select name="plan_name" class="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-amber-500">
                        <option value="EDUBARI Standard">EDUBARI Standard (৳550 / মাস)</option>
                        <option value="EDUBARI Business" selected>EDUBARI Business (৳1,200 / মাস)</option>
                        <option value="EDUBARI Enterprise">EDUBARI Enterprise (৳2,500 / মাস)</option>
                    </select>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-semibold text-slate-300 mb-1">মেয়াদ (মাস)</label>
                        <select name="duration_months" class="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-amber-500">
                            <option value="1">১ মাস</option>
                            <option value="6">৬ মাস (১০% ছাড়)</option>
                            <option value="12">১২ মাস (২০% ছাড়)</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-300 mb-1">প্রদেয় টাকা (৳)</label>
                        <input type="number" name="price" value="1200" class="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-amber-500" required />
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-300 mb-1">পেমেন্ট মাধ্যম</label>
                    <select name="payment_method" class="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-amber-500">
                        <option value="bkash">bKash (বিকাশ)</option>
                        <option value="nagad">Nagad (নগদ)</option>
                        <option value="rocket">Rocket (রকেট)</option>
                        <option value="bank">Bank Transfer</option>
                    </select>
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-300 mb-1">আপনার bKash / কন্টাক্ট নম্বর</label>
                    <input type="text" name="phone" placeholder="e.g. 01712345678" class="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-amber-500" required />
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-300 mb-1">bKash Transaction ID (TrxID)</label>
                    <input type="text" name="transaction_id" placeholder="e.g. BK89X721LM" class="w-full bg-slate-800 border border-slate-700 font-mono text-amber-400 rounded-xl p-3 focus:ring-2 focus:ring-amber-500 uppercase tracking-widest" required />
                </div>

                <button type="submit" class="w-full py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold rounded-xl shadow-lg transition">
                    পেমেন্ট ভেরিফিকেশন রিকোয়েস্ট পাঠান
                </button>
            </form>
        </div>
    </div>

</div>
@endsection
```

---

### 4️⃣ Add Web Routes in `routes/web.php`

```php
use App\Http\Controllers\Admin\SubscriptionController;

Route::middleware(['auth'])->prefix('admin')->name('admin.')->group(function () {
    
    // Bottom menu route for Subscription
    Route::get('/subscription', [SubscriptionController::class, 'index'])->name('subscription.index');
    Route::post('/subscription/payment', [SubscriptionController::class, 'submitPayment'])->name('subscription.payment');

});
```

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
