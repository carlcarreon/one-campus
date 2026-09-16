<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class FeedController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('feed/index');
    }
}
