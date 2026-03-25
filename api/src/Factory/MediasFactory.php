<?php

namespace App\Factory;

use App\Entity\Medias;
use Zenstruck\Foundry\Persistence\PersistentObjectFactory;

/**
 * @extends PersistentObjectFactory<Medias>
 */
final class MediasFactory extends PersistentObjectFactory
{
    public static function class(): string
    {
        return Medias::class;
    }

    /**
     * @return array<string, mixed>
     */
    protected function defaults(): array
    {
        return [
            'filePath' => self::faker()->uuid().'.jpg',
            'runner' => UserFactory::new(),
        ];
    }
}
