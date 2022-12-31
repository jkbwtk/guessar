<?php


class Avatar {
  private int $id;
  private int $user_id;
  private string $mime;
  private string $image;
  private int $created_at;

  public function __construct(
    int $id,
    int $user_id,
    string $mime,
    string $image,
    int $created_at
  ) {
    $this->id = $id;
    $this->user_id = $user_id;
    $this->mime = $mime;
    $this->image = $image;
    $this->created_at = $created_at;
  }

  public static function NewAvatar(
    int $user_id,
    string $mime,
    string $image
  ): Avatar {
    return new Avatar(
      0,
      $user_id,
      $mime,
      $image,
      0
    );
  }

  public function getId(): int {
    return $this->id;
  }

  public function getUserId(): int {
    return $this->user_id;
  }

  public function getMime(): string {
    return $this->mime;
  }

  public function getImage(): string {
    return $this->image;
  }

  public function getCreatedAt(): int {
    return $this->created_at;
  }

  public function setMime(string $mime): void {
    $this->mime = $mime;
  }

  public function setImage(string $image): void {
    $this->image = $image;
  }

  public function toObject() {
    return [
      'id' => $this->id,
      'user_id' => $this->user_id,
      'mime' => $this->mime,
      'image' => $this->image,
      'created_at' => $this->created_at
    ];
  }

  public function toJSON(): string {
    return json_encode($this->toObject());
  }
}
