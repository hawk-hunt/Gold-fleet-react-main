<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MapClick extends Model
{
    protected $table = 'map_clicks';

    protected $fillable = [
        'lat', 'lng', 'address'
    ];
}
