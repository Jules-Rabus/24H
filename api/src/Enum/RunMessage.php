<?php

namespace App\Enum;

enum RunMessage : string
{
    case RUN_STARTED = 'run_started';
    case RUN_FINISHED = 'run_finished';
    case RUN_FAILED = 'run_failed';
}
