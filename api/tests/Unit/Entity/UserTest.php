<?php

namespace App\Tests\Unit\Entity;

use App\Entity\User;
use PHPUnit\Framework\TestCase;

class UserTest extends TestCase
{
    private const EMAIL = 'test@test.com';
    private const PASSWORD = 'password';

    public function testGetId()
    {
        $user = new User();
        $this->assertNull($user->getId());
    }

    public function testGetEmail()
    {
        $user = new User();
        $this->assertNull($user->getEmail());
    }

    public function testSetEmail()
    {
        $user = new User();
        $user->setEmail(self::EMAIL);
        $this->assertEquals(self::EMAIL, $user->getEmail());
    }

    public function testGetUserIdentifier()
    {
        $user = new User();
        $user->setEmail(self::EMAIL);
        $this->assertEquals(self::EMAIL, $user->getUserIdentifier());
    }

    public function testGetRoles()
    {
        $user = new User();
        $this->assertIsArray($user->getRoles());
    }

    public function testGetPassword()
    {
        $user = new User();
        $this->assertNull($user->getPassword());
    }

    public function testSetPassword()
    {
        $user = new User();
        $user->setPassword(self::PASSWORD);
        $this->assertEquals(self::PASSWORD, $user->getPassword());
    }
}
