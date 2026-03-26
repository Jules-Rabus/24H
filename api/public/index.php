<?php

use App\Kernel;

require_once dirname(__DIR__).'/vendor/autoload.php';

if (!function_exists('array_any')) {
    function array_any(array $array, callable $callback): bool {
        foreach ($array as $key => $value) {
            if ($callback($value, $key)) {
                return true;
            }
        }
        return false;
    }
}

require_once dirname(__DIR__).'/vendor/autoload_runtime.php';

return function (array $context) {
    return new Kernel($context['APP_ENV'], (bool) $context['APP_DEBUG']);
};
