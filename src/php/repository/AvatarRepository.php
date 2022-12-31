<?php

require_once 'Repository.php';
require_once __DIR__ . '/../models/Avatar.php';

class AvatarRepository extends Repository {

  public function getAvatarById(int $id): ?Avatar {
    $stmt = $this->database->getConnection()->prepare('SELECT * FROM "Avatars" WHERE id = :id LIMIT 1');
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();

    return $this->statementToAvatar($stmt);
  }

  public function getAvatarByUserId(int $userId): ?Avatar {
    $stmt = $this->database->getConnection()->prepare('SELECT * FROM "Avatars" WHERE user_id = :user_id LIMIT 1');
    $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
    $stmt->execute();

    return $this->statementToAvatar($stmt);
  }

  public function createAvatar(Avatar $avatar): ?Avatar {
    $stmt = $this->database->getConnection()->prepare('INSERT INTO "Avatars" (user_id, mime, image)
      VALUES (:user_id, :mime, :image)
    ');

    $stmt->execute([
      'user_id' => $avatar->getUserId(),
      'mime' => $avatar->getMime(),
      'image' => base64_encode($avatar->getImage()),
    ]);

    return $this->getAvatarByUserId($avatar->getUserId());
  }

  public function updateAvatar(Avatar $avatar): ?Avatar {
    $stmt = $this->database->getConnection()->prepare('UPDATE "Avatars" SET
        mime = :mime,
        image = :image,
        created_at = current_timestamp
      WHERE id = :id
    ');

    $stmt->execute([
      'id' => $avatar->getId(),
      'mime' => $avatar->getMime(),
      'image' => base64_encode($avatar->getImage()),
    ]);

    return $this->getAvatarByUserId($avatar->getUserId());
  }

  public function deleteAvatar(Avatar $avatar): void {
    $stmt = $this->database->getConnection()->prepare('DELETE FROM "Avatars" WHERE user_id = :user_id');
    $stmt->execute([
      'user_id' => $avatar->getUserId(),
    ]);
  }

  private function statementToAvatar(PDOStatement $stmt): ?Avatar {
    $avatar = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($avatar == false) {
      return null;
    }

    return new Avatar(
      $avatar['id'],
      $avatar['user_id'],
      $avatar['mime'],
      base64_decode($avatar['image']),
      strtotime($avatar['created_at'])
    );
  }
}
