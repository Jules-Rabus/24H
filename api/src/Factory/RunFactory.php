<?php

namespace App\Factory;

use App\Entity\Run;
use Zenstruck\Foundry\Persistence\PersistentProxyObjectFactory;

/**
 * @extends PersistentProxyObjectFactory<Run>
 */
final class RunFactory extends PersistentProxyObjectFactory
{
    public static function class(): string
    {
        return Run::class;
    }

    public function __construct()
    {
        parent::__construct();
    }

    /**
     * @see https://symfony.com/bundles/ZenstruckFoundryBundle/current/index.html#model-factories
     *
     * @return array<string, mixed>
     */
    protected function defaults(): array
    {
        return [
            'startDate' => self::faker()->dateTimeBetween('-30 minutes', '+30 minutes'),
            'endDate' => self::faker()->dateTimeBetween('+30 minutes', '+1 hour'),
            'runner' => UserFactory::new(),
        ];
    }
}
