<?php


enum UserFlags: int {
  case USER = 0; // always a user
  case MODERATOR = 1;
  case ADMIN = 2;
  case BANNED = 4;
  case DELETED = 8;
  case DEVELOPER = 16;
}

class User {
  private int $id;
  private string $username;
  private int $discriminator;
  private string $email;
  private string $password;
  private ?int $avatar;
  private int $flags;
  private int $created_at;


  public function __construct(
    int $id,
    string $username,
    int $discriminator,
    string $email,
    string $password,
    ?int $avatar,
    int $flags,
    int $created_at
  ) {
    $this->id = $id;
    $this->username = $username;
    $this->discriminator = $discriminator;
    $this->email = $email;
    $this->password = $password;
    $this->avatar = $avatar;
    $this->flags = $flags;
    $this->created_at = $created_at;
  }

  public static function NewUser(
    string $username,
    string $email,
    string $password
  ): User {
    return new User(
      0,
      $username,
      0,
      $email,
      User::hashFunction($password),
      null,
      0,
      0
    );
  }

  public function getId(): int {
    return $this->id;
  }

  public function getUsername(): string {
    return $this->username;
  }

  public function getDiscriminator(): int {
    return $this->discriminator;
  }

  public function getEmail(): string {
    return $this->email;
  }

  public function getPassword(): string {
    return $this->password;
  }

  public function getAvatar(): ?int {
    return $this->avatar;
  }

  public function getFlags(): int {
    return $this->flags;
  }

  public function getCreatedAt(): int {
    return $this->created_at;
  }

  public function setUsername(string $username): void {
    $this->username = $username;
  }

  public function setDiscriminator(int $discriminator): void {
    $this->discriminator = $discriminator;
  }

  public function setEmail(string $email): void {
    $this->email = $email;
  }

  public function setPassword(string $nonHashedPassword): void {
    $this->password = User::hashFunction($nonHashedPassword);
  }

  public function setAvatar(int $avatar): void {
    $this->avatar = $avatar;
  }

  public function setFlags(int $flags): void {
    $this->flags = $flags;
  }

  public function setCreatedAt(int $created_at): void {
    $this->created_at = $created_at;
  }

  public function hasFlag(UserFlags $flag): bool {
    return ($this->flags & $flag->value) === $flag;
  }

  public function addFlag(UserFlags $flag): void {
    $this->flags += $flag->value;
  }

  public function removeFlag(UserFlags $flag): void {
    $this->flags -= $flag->value;
  }

  public function validatePassword(string $nonHashedPassword): bool {
    return $this->password === User::hashFunction($nonHashedPassword);
  }

  private static function hashFunction(string $text): string {
    return hash('sha384', $text);
  }

  public function toObject(bool $verbose = true) {
    return $verbose ? [
      'id' => $this->id,
      'username' => $this->username,
      'discriminator' => $this->discriminator,
      'email' => $this->email,
      'avatar' => $this->avatar,
      'flags' => $this->flags,
      'created_at' => $this->created_at
    ] : [
      'username' => $this->username,
      'discriminator' => $this->discriminator,
      'avatar' => $this->avatar,
      'flags' => $this->flags,
      'created_at' => $this->created_at
    ];
  }

  public function toJSON(bool $verbose = false): string {
    return json_encode($this->toObject($verbose));
  }
}
