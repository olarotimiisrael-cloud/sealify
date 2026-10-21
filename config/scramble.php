<?php

use Dedoc\Scramble\Http\Middleware\RestrictedDocsAccess;
use Dedoc\Scramble\OpenApiVersion;
use Dedoc\Scramble\SecurityDocumentation\MiddlewareAuthSecurityStrategy;

return [

    'info' => [
        'version' => '1.0.0',
        'title' => 'Sealify Nigeria API',
        'description' => 'Trusted local marketplace API for Ogbomosoland and Oyo State. '
                       .'Browse listings, message sellers, boost ads, manage payouts.',
    ],

    'servers' => [
        'Local' => 'http://127.0.0.1:8000/api',
        'Production' => 'https://api.sealify.ng/api',
    ],

    'api_path' => 'api',
    'api_domain' => null,

    'export_path' => 'api.json',

    'cache' => [
        'key' => 'scramble.openapi',
        'store' => 'file',
    ],

    'openapi_version' => OpenApiVersion::V3_1,

    'ui' => [
        'title' => 'Sealify Nigeria API',
    ],

    'dev_tools' => [
        'enabled' => env('SCRAMBLE_DEV_TOOLS', env('APP_DEBUG', false)),
    ],

    'renderer' => 'elements',

    'renderers' => [
        'elements' => [
            'view' => 'scramble::docs',
            'theme' => 'light',
            'hideTryIt' => false,
            'hideSchemas' => false,
            'logo' => '',
            'tryItCredentialsPolicy' => 'include',
            'layout' => 'responsive',
            'router' => 'hash',
        ],
        'scalar' => [
            'view' => 'scramble::scalar',
            'cdn' => 'https://cdn.jsdelivr.net/npm/@scalar/api-reference',
            'theme' => 'laravel',
            'proxyUrl' => 'https://proxy.scalar.com',
            'darkMode' => false,
            'showDeveloperTools' => 'never',
            'agent' => ['disabled' => true],
            'credentials' => 'include',
        ],
    ],

    'enum_cases_description_strategy' => 'description',
    'enum_cases_names_strategy' => false,

    'flatten_deep_query_parameters' => true,

    'middleware' => [
        'web',
        RestrictedDocsAccess::class,
    ],

    'extensions' => [],

    'security_strategy' => MiddlewareAuthSecurityStrategy::class,

];
