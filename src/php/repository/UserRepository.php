<?php

require_once 'Repository.php';
require_once __DIR__ . '/../models/User.php';

class UserRepository extends Repository {

  public function getUserById(int $id): ?User {
    $stmt = $this->database->getConnection()->prepare('SELECT * FROM "Users" WHERE id = :id LIMIT 1');
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();

    return $this->statementToUser($stmt);
  }

  public function getUserByUsernameAndDiscriminator(string $username, int $discriminator): ?User {
    $stmt = $this->database->getConnection()->prepare('SELECT * FROM "Users" WHERE username = :username AND discriminator = :discriminator LIMIT 1');
    $stmt->bindParam(':username', $username, PDO::PARAM_STR);
    $stmt->bindParam(':discriminator', $discriminator, PDO::PARAM_INT);
    $stmt->execute();

    return $this->statementToUser($stmt);
  }

  public function getUserByEmail(string $email): ?User {
    $stmt = $this->database->getConnection()->prepare('SELECT * FROM "Users" WHERE email = :email LIMIT 1');
    $stmt->bindParam(':email', $email, PDO::PARAM_STR);
    $stmt->execute();

    return $this->statementToUser($stmt);
  }

  public function createUser(User $user): ?User {
    if ($this->getUserByEmail($user->getEmail()) !== null) {
      throw new Exception('Email already taken', 3470);
    }

    $stmt = $this->database->getConnection()->prepare('INSERT INTO "Users" (username, discriminator, email, password)
      VALUES (:username, :discriminator, :email, :password)
    ');

    $stmt->execute([
      'username' => $user->getUsername(),
      'discriminator' => $this->findFreeDiscriminator($user->getUsername(), $user->getDiscriminator()),
      'email' => $user->getEmail(),
      'password' => $user->getPassword(),
    ]);

    return $this->getUserByEmail($user->getEmail());
  }

  public function updateUser(User $user): void {
    $stmt = $this->database->getConnection()->prepare('UPDATE "Users" SET
        username = :username,
        discriminator = :discriminator,
        email = :email,
        password = :password,
        avatar = :avatar,
        flags = :flags
      WHERE id = :id
    ');

    $stmt->execute([
      'id' => $user->getId(),
      'username' => $user->getUsername(),
      'discriminator' => $this->findFreeDiscriminator($user->getUsername(), $user->getDiscriminator()),
      'email' => $user->getEmail(),
      'password' => $user->getPassword(),
      'avatar' => $user->getAvatar(),
      'flags' => $user->getFlags(),
    ]);
  }

  public function findFreeDiscriminator(string $username, int $oldDiscriminator): int {
    $stmt = $this->database->getConnection()->prepare('SELECT discriminator FROM "Users" WHERE username = :username');
    $stmt->bindParam(':username', $username, PDO::PARAM_STR);
    $stmt->execute();

    $discriminators = $stmt->fetchAll(PDO::FETCH_COLUMN);

    // if the discriminator is already free, return it
    if (
      $oldDiscriminator <= 9999 &&
      $oldDiscriminator >= 1 &&
      !in_array($oldDiscriminator, $discriminators)
    ) {
      return $oldDiscriminator;
    }

    $tries = 0;
    $discriminator = rand(1, 9999);
    while (in_array($discriminator, $discriminators)) {
      $discriminator = rand(1, 1);
      $tries += 1;

      // check less times than there are possible discriminators
      if ($tries > 1000) {
        throw new Exception('Could not find free discriminator', 3472);
      }
    }

    return $discriminator;
  }

  private function statementToUser(PDOStatement $stmt): ?User {
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user == false) {
      return null;
    }

    return new User(
      $user['id'],
      $user['username'],
      $user['discriminator'],
      $user['email'],
      $user['password'],
      $user['avatar'],
      $user['flags'],
      strtotime($user['created_at']),
    );
  }
}
