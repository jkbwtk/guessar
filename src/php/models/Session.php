<?php


class Session {
  private int $id;
  private int $user_id;
  private string $token;
  private int $created_at;
  private int $refreshed_at;

  public function __construct(
    int $id,
    int $user_id,
    string $token,
    int $created_at,
    int $refreshed_at
  ) {
    $this->id = $id;
    $this->user_id = $user_id;
    $this->token = $token;
    $this->created_at = $created_at;
    $this->refreshed_at = $refreshed_at;
  }

  public static function NewSession(
    int $user_id,
  ): Session {
    return new Session(
      0,
      $user_id,
      Session::generateToken($user_id),
      0,
      0,
    );
  }

  public function getId(): int {
    return $this->id;
  }

  public function getUserId(): int {
    return $this->user_id;
  }

  public function getToken(): string {
    return $this->token;
  }

  public function getCreatedAt(): int {
    return $this->created_at;
  }

  public function getRefreshedAt(): int {
    return $this->refreshed_at;
  }

  private static function generateToken(int $user_id): string {
    return hash('sha384', $user_id . time() . bin2hex(random_bytes(512)));
  }

  public function isExpired(): bool {
    return $this->refreshed_at < time() - 60 * 30;
  }

  public function expiresAt(): int {
    return $this->refreshed_at + 60 * 30;
  }

  public function toObject(): object {
    return (object) [
      'id' => $this->id,
      'user_id' => $this->user_id,
      'token' => $this->token,
      'created_at' => $this->created_at,
      'refreshed_at' => $this->refreshed_at
    ];
  }

  public function toJSON(): string {
    return json_encode($this->toObject());
  }
}
