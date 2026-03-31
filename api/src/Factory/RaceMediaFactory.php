<?php

namespace App\Factory;

use App\Entity\RaceMedia;
use Zenstruck\Foundry\Persistence\PersistentObjectFactory;

/**
 * @extends PersistentObjectFactory<RaceMedia>
 */
final class RaceMediaFactory extends PersistentObjectFactory
{
    public static function class(): string
    {
        return RaceMedia::class;
    }

    /**
     * @return array<string, mixed>
     */
    protected function defaults(): array
    {
        return [
            'filePath' => self::faker()->uuid().'.jpg',
            'comment' => self::faker()->sentence(),
        ];
    }
}
