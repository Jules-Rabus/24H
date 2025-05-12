<?php
namespace App\Dto;

use App\Entity\Participation;
use Symfony\Component\Serializer\Annotation\Groups;

final class DataMatrixInput
{
    /**
     * Le JSON extrait du data-matrix
     * {"originId":"2","firstName":"Jules","lastName":"Rabus"}
     */
    #[Groups([Participation::WRITE])]
    public string $rawValue;
}
