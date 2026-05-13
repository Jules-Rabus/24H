<?php

namespace App\Tests\Functional\Api\User;

use App\ApiResource\User\UserApi;
use App\Factory\UserFactory;
use App\Tests\Functional\Api\AbstractTestCase;

/**
 * Covers the SearchFilter properties declared on UserApi for the admin
 * /users route. Drives each filter the front (useAdminUsersQuery) actually
 * sends. Pagination and ordering are framework concerns handled by API
 * Platform itself — not retested here.
 */
final class UserFilterTest extends AbstractTestCase
{
    private const string ROUTE = '/users';

    public function testFilterById(): void
    {
        $target = UserFactory::createOne();
        UserFactory::createMany(3);

        $response = $this->createClientWithCredentials()
            ->request('GET', self::ROUTE.'?id='.$target->getId());

        $this->assertResponseIsSuccessful();
        $data = $response->toArray();
        $this->assertCount(1, $data);
        $this->assertSame($target->getId(), $data[0]['id']);
        $this->assertMatchesResourceCollectionJsonSchema(UserApi::class);
    }

    public function testFilterByFirstNameIstart(): void
    {
        UserFactory::createOne(['firstName' => 'Alice']);
        UserFactory::createOne(['firstName' => 'Alan']);
        UserFactory::createOne(['firstName' => 'Bob']);

        $response = $this->createClientWithCredentials()
            ->request('GET', self::ROUTE.'?firstName=al');

        $this->assertResponseIsSuccessful();
        $names = array_column($response->toArray(), 'firstName');
        sort($names);
        $this->assertSame(['Alan', 'Alice'], $names);
        $this->assertMatchesResourceCollectionJsonSchema(UserApi::class);
    }

    public function testFilterByLastNameIstart(): void
    {
        UserFactory::createOne(['firstName' => 'X', 'lastName' => 'Smith']);
        UserFactory::createOne(['firstName' => 'Y', 'lastName' => 'Smithson']);
        UserFactory::createOne(['firstName' => 'Z', 'lastName' => 'Jones']);

        $response = $this->createClientWithCredentials()
            ->request('GET', self::ROUTE.'?lastName=smi');

        $this->assertResponseIsSuccessful();
        $this->assertCount(2, $response->toArray());
        $this->assertMatchesResourceCollectionJsonSchema(UserApi::class);
    }

    public function testFilterBySurnameIstart(): void
    {
        UserFactory::createOne(['surname' => 'Speedy']);
        UserFactory::createOne(['surname' => 'Sprinter']);
        UserFactory::createOne(['surname' => 'Walker']);

        $response = $this->createClientWithCredentials()
            ->request('GET', self::ROUTE.'?surname=sp');

        $this->assertResponseIsSuccessful();
        $this->assertCount(2, $response->toArray());
        $this->assertMatchesResourceCollectionJsonSchema(UserApi::class);
    }

    public function testFilterByEmailIstart(): void
    {
        UserFactory::createOne(['email' => 'alice.runner@example.com']);
        UserFactory::createOne(['email' => 'alex.runner@example.com']);
        UserFactory::createOne(['email' => 'bob@example.com']);

        $response = $this->createClientWithCredentials()
            ->request('GET', self::ROUTE.'?email=al');

        $this->assertResponseIsSuccessful();
        $emails = array_column($response->toArray(), 'email');
        sort($emails);
        $this->assertSame(['alex.runner@example.com', 'alice.runner@example.com'], $emails);
        $this->assertMatchesResourceCollectionJsonSchema(UserApi::class);
    }

    public function testFilterByOrganizationIstart(): void
    {
        UserFactory::createOne(['organization' => 'ACBB']);
        UserFactory::createOne(['organization' => 'ASPO']);
        UserFactory::createOne(['organization' => 'AC Beauvais']);

        $response = $this->createClientWithCredentials()
            ->request('GET', self::ROUTE.'?organization=ac');

        $this->assertResponseIsSuccessful();
        $this->assertCount(2, $response->toArray());
        $this->assertMatchesResourceCollectionJsonSchema(UserApi::class);
    }
}
