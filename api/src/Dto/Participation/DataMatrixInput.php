<?php

namespace App\Dto\Participation;

final class DataMatrixInput
{
    /**
     * Le JSON extrait du data-matrix
     * {"originId":"2","firstName":"Jules","lastName":"Rabus"}.
     */
    public string $rawValue = '';
}
