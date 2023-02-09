<?php

// negated
enum GameSettings: int {
  case MOVE = 1;
  case PAN = 2;
  case ZOOM = 4;
}

class Game {
  private string $uniqid;
  private ?int $user_id;
  private int $settings;
  private int $time_limit; // in seconds, per round
  private int $rounds;
  private ?float $final_score;
  private ?int $final_time;
  // private ?array $final_rounds;
  private int $created_at;

  public function __construct(
    string $uniqid,
    ?int $user_id,
    int $settings,
    int $time_limit,
    int $rounds,
    ?float $final_score,
    ?int $final_time,
    // ?array $final_rounds,
    int $created_at,
  ) {
    $this->uniqid = $uniqid;
    $this->user_id = $user_id;
    $this->settings = $settings;
    $this->time_limit = $time_limit;
    $this->rounds = $rounds;
    $this->final_score = $final_score;
    $this->final_time = $final_time;
    // $this->final_rounds = $final_rounds;
    $this->created_at = $created_at;
  }

  public static function NewGame(
    ?int $user_id,
    int $settings,
    int $time_limit,
    int $rounds
  ): Game {
    return new Game(
      self::generateUniqid(),
      $user_id,
      $settings,
      $time_limit,
      $rounds,
      null,
      null,
      // null,
      0,
    );
  }

  public function getUniqid(): string {
    return $this->uniqid;
  }

  public function getUserId(): ?int {
    return $this->user_id;
  }

  public function getSettings(): int {
    return $this->settings;
  }

  public function getTimeLimit(): int {
    return $this->time_limit;
  }

  public function getRounds(): int {
    return $this->rounds;
  }

  public function getFinalScore(): ?float {
    return $this->final_score;
  }

  public function getFinalTime(): ?int {
    return $this->final_time;
  }

  // public function getFinalRounds(): ?array {
  //   return $this->final_rounds;
  // }

  public function getCreatedAt(): int {
    return $this->created_at;
  }

  public function setFinalScore(float $final_score): void {
    $this->final_score = $final_score;
  }

  // public function setFinalTime(int $final_time): void {
  //   $this->final_time = $final_time;
  // }

  // public function setFinalRounds(array $final_rounds): void {
  //   $this->final_rounds = $final_rounds;
  // }

  public function isFinished(): bool {
    return $this->final_score !== null;
  }

  public function finish(array $rounds): void {
    $this->final_score = 0;
    $this->final_time = 0;

    foreach ($rounds as $round) {
      if (!$round->isFinished()) {
        throw new Exception('Cannot finish game with unfinished rounds');
      }

      if ($round->getTime() <= $this->time_limit) {
        $this->final_score += $round->getScore();
        $this->final_time += $round->getTime();
      }
    }

    // $this->final_rounds = $rounds;
  }

  private static function generateUniqid(): string {
    return uniqid();
  }

  public function hasFlag(GameSettings $flag): bool {
    return ($this->settings & $flag->value) === $flag;
  }

  public function toObject(bool $verbose = true) {
    return [
      'uniqid' => $this->uniqid,
      'user_id' => $this->user_id,
      'settings' => $this->settings,
      'time_limit' => $this->time_limit,
      'rounds' => $this->rounds,
      'final_score' => $this->final_score,
      'final_time' => $this->final_time,
      // 'final_rounds' => $this->final_rounds,
      'created_at' => $this->created_at,
    ];
  }

  public function toJSON(bool $verbose = false): string {
    return json_encode($this->toObject());
  }
}
