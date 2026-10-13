<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_the_api_application_is_available(): void
    {
        $this->postJson('/api/copilot', [
            'message' => 'health check',
            'conversation' => [],
        ])->assertOk();
    }
}
