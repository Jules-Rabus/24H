<?php

namespace App\Dto\Participation;

/**
 * Lightweight participation DTO for embedding in public user responses.
 */
final class ParticipationPublic
{
    public int $id;

    public ?int $runId = null;

    public ?\DateTimeInterface $runStartDate = null;

    public ?\DateTimeInterface $runEndDate = null;

    public ?\DateTimeInterface $arrivalTime = null;

    public ?int $totalTime = null;

    public string $status = 'IN_PROGRESS';
}
