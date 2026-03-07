<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class IssueAttachment extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'issue_id',
        'file_path',
        'file_name',
        'file_type',
        'file_size',
    ];

    public function issue(): BelongsTo
    {
        return $this->belongsTo(Issue::class);
    }
}
