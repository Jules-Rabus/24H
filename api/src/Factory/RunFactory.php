<?php

namespace App\Factory;

use App\Entity\Run;
use Zenstruck\Foundry\Persistence\PersistentObjectFactory;

/**
 * @extends PersistentObjectFactory<Run>
 */
final class RunFactory extends PersistentObjectFactory
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
            'startDate' => self::faker()->dateTimeBetween('+1 day', '+7 days'),
            'endDate' => self::faker()->dateTimeBetween('+8 days', '+14 days'),
        ];
    }
}
