<?php

namespace App\Factory;

use App\Entity\Participation;
use Zenstruck\Foundry\Persistence\PersistentObjectFactory;

/**
 * @extends PersistentObjectFactory<Participation>
 */
final class ParticipationFactory extends PersistentObjectFactory
{
    public static function class(): string
    {
        return Participation::class;
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
            'run' => RunFactory::new(),
            'user' => UserFactory::new(),
            'arrivalTime' => null,
        ];
    }
}
