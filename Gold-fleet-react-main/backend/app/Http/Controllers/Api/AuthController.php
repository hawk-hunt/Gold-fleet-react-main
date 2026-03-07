<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    /**
     * Handle user login and return API token.
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials',
            ], 401);
        }

        // Email verification requirement removed - allow login immediately

        // Generate a simple token (use Str::random(80) or a more robust method in production)
        $token = \Illuminate\Support\Str::random(80);
        $user->update(['api_token' => $token]);

        return response()->json([
            'success' => true,
            'message' => 'Logged in successfully',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'company_id' => $user->company_id,
                'email_verified' => $user->hasVerifiedEmail(),
            ],
        ]);
    }

    /**
     * Handle user registration and send verification email.
     */
    public function register(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
                'password' => ['required', 'confirmed', 'min:8'],
                'company_name' => ['required', 'string', 'max:255'],
                'company_email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.Company::class.',email'],
                'company_phone' => ['nullable', 'string', 'max:20'],
                'company_address' => ['nullable', 'string', 'max:500'],
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        }

        // Use database transaction to ensure atomicity
        try {
            $result = DB::transaction(function () use ($validated) {
                // Create company
                $company = Company::create([
                    'name' => $validated['company_name'],
                    'email' => $validated['company_email'],
                    'phone' => $validated['company_phone'] ?? null,
                    'address' => $validated['company_address'] ?? null,
                ]);

                // Create user without api_token (only after email verification)
                $user = User::create([
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                    'password' => Hash::make($validated['password']),
                    'role' => 'admin',
                    'company_id' => $company->id,
                ]);

                // Create api token so user can use the API immediately
                $token = \Illuminate\Support\Str::random(80);
                $user->update(['api_token' => $token]);

                return compact('user', 'company', 'token');
            });

            return response()->json([
                'success' => true,
                'message' => 'Registration successful.',
                'token' => $result['token'],
                'user' => [
                    'id' => $result['user']->id,
                    'name' => $result['user']->name,
                    'email' => $result['user']->email,
                    'email_verified' => (bool) $result['user']->email_verified_at,
                ],
                'company' => [
                    'id' => $result['company']->id,
                    'name' => $result['company']->name,
                    'email' => $result['company']->email,
                ],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Registration failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Rollback signup - delete user and company if subscription setup fails.
     * This is called from the frontend if the subscription creation fails.
     */
    public function cancelSignup(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'user_id' => 'required|integer|exists:users,id',
                'company_id' => 'required|integer|exists:companies,id',
            ]);

            // Use transaction to delete both atomically
            DB::transaction(function () use ($validated) {
                // Delete user
                User::findOrFail($validated['user_id'])->delete();
                // Delete company
                Company::findOrFail($validated['company_id'])->delete();
            });

            return response()->json([
                'success' => true,
                'message' => 'Signup cancelled and user/company deleted.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel signup: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle user logout.
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user) {
            $user->update(['api_token' => null]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * Get authenticated user.
     */
    public function user(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
            ], 401);
        }

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'company_id' => $user->company_id,
                'email_verified' => $user->hasVerifiedEmail(),
            ],
        ]);
    }
}
