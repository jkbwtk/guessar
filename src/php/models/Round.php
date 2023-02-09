<?php

require_once 'Coordinates.php';


class Round {
  private int $id;
  private string $game_uniqid;
  private int $round_number;
  private string $target_uuid;
  private Coordinates $target_coordinates;
  private ?Coordinates $guess_coordinates;
  private int $created_at;
  private int $updated_at;
  private ?int $ended_at;


  public function __construct(
    int $id,
    string $game_uniqid,
    int $number,
    string $target_uuid,
    Coordinates $target_coordinates,
    ?Coordinates $guess_coordinates,
    int $created_at,
    int $updated_at,
    ?int $ended_at
  ) {
    $this->id = $id;
    $this->game_uniqid = $game_uniqid;
    $this->round_number = $number;
    $this->target_uuid = $target_uuid;
    $this->target_coordinates = $target_coordinates;
    $this->guess_coordinates = $guess_coordinates;
    $this->created_at = $created_at;
    $this->updated_at = $updated_at;
    $this->ended_at = $ended_at;
  }

  public static function NewRound(
    string $game_uniqid,
    int $number,
    string $target_uuid,
    Coordinates $target_coordinates
  ): Round {
    return new Round(
      0,
      $game_uniqid,
      $number,
      $target_uuid,
      $target_coordinates,
      null,
      0,
      0,
      null
    );
  }

  public function getId(): int {
    return $this->id;
  }

  public function getGameUniqid(): string {
    return $this->game_uniqid;
  }

  public function getRoundNumber(): int {
    return $this->round_number;
  }

  public function getTargetUuid(): string {
    return $this->target_uuid;
  }

  public function getTargetCoordinates(): Coordinates {
    return $this->target_coordinates;
  }

  public function getGuessCoordinates(): ?Coordinates {
    return $this->guess_coordinates;
  }

  public function getScore(): float {
    if ($this->guess_coordinates === null)
      return 0;

    if (!$this->isFinished())
      return 0;

    $maxPoints = 1000;
    $distance = $this->target_coordinates->distanceTo($this->guess_coordinates);

    // account for inaccuracies in map/marker placement
    $distance -= 10;
    $distance = max(0, $distance);

    // $score = log($distance / 100 + 1, 2) * 205;
    $score = $maxPoints - $distance;
    $score = max(0, $score);

    return $score;
  }

  public function getCreatedAt(): int {
    return $this->created_at;
  }

  public function getUpdatedAt(): int {
    return $this->updated_at;
  }

  public function getEndedAt(): ?int {
    return $this->ended_at;
  }

  public function getTime(): int {
    if (!$this->isFinished())
      return 0;

    return $this->getEndedAt() - $this->getCreatedAt();
  }

  public function setGuessCoordinates(Coordinates $guess_coordinates): void {
    $this->guess_coordinates = $guess_coordinates;
  }

  public function isFinished(): bool {
    return $this->ended_at !== null;
  }

  public function toObject(bool $verbose = true) {
    return [
      'id' => $this->id,
      'game_uniqid' => $this->game_uniqid,
      'number' => $this->round_number,
      'target_uuid' => $this->target_uuid,
      'target_coordinates' => $this->target_coordinates->toObject(),
      'guess_coordinates' => $this->guess_coordinates === null ? null : $this->guess_coordinates->toObject(),
      'score' => $this->getScore(),
      'created_at' => $this->created_at,
      'updated_at' => $this->updated_at,
      'ended_at' => $this->ended_at
    ];
  }

  public function toJSON(bool $verbose = false): string {
    return json_encode($this->toObject());
  }
}