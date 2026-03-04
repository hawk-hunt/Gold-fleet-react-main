<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\MapClick;
use Illuminate\Support\Facades\Validator;

class MapClickController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
            'address' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $click = MapClick::create($data);

        return response()->json(['message' => 'Saved', 'data' => $click], 201);
    }

    public function index(Request $request)
    {
        $perPage = $request->query('per_page', 20);
        $items = MapClick::orderBy('created_at', 'desc')->paginate($perPage);
        return response()->json($items);
    }
}
