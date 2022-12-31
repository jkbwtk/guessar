<?php

require_once 'Repository.php';
require_once __DIR__ . '/../models/Session.php';

class SessionRepository extends Repository {

  public function getSessionById(int $id, bool $verify = true): ?Session {
    $stmt = $this->database->getConnection()->prepare('SELECT * FROM "Sessions" WHERE id = :id LIMIT 1');
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();

    $session = $this->statementToSession($stmt);
    if ($verify) return $this->returnVerifiedSession($session);
    else return $session;
  }

  public function getSessionByToken(string $token, bool $verify = true): ?Session {
    $stmt = $this->database->getConnection()->prepare('SELECT * FROM "Sessions" WHERE token = :token LIMIT 1');
    $stmt->bindParam(':token', $token, PDO::PARAM_STR);
    $stmt->execute();

    $session = $this->statementToSession($stmt);
    if ($verify) return $this->returnVerifiedSession($session);
    else return $session;
  }

  public function createSession(Session $session): ?Session {
    $stmt = $this->database->getConnection()->prepare('INSERT INTO "Sessions" (user_id, token)
      VALUES (:user_id, :token)
    ');

    $stmt->execute([
      'user_id' => $session->getUserId(),
      'token' => $session->getToken(),
    ]);

    return $this->getSessionByToken($session->getToken());
  }

  public function deleteSession(Session $session): void {
    $stmt = $this->database->getConnection()->prepare('DELETE FROM "Sessions" WHERE id = :id');
    $stmt->execute([
      'id' => $session->getId(),
    ]);

    // if (rand(0, 100) < 10) $this->deleteExpiredSessions();
    $this->deleteExpiredSessions();
  }

  public function deleteSessionsByUserId(int $userId): void {
    $stmt = $this->database->getConnection()->prepare('DELETE FROM "Sessions" WHERE user_id = :user_id');
    $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
    $stmt->execute();
  }

  public function refreshSession(Session $session): ?Session {
    if ($session->isExpired()) {
      $this->deleteSession($session);
      return null;
    }

    $stmt = $this->database->getConnection()->prepare('UPDATE "Sessions" SET refreshed_at = current_timestamp WHERE id = :id');
    $stmt->execute([
      'id' => $session->getId(),
    ]);

    return $this->getSessionById($session->getId(), false);
  }

  public function deleteExpiredSessions(): void {
    $stmt = $this->database->getConnection()->prepare('DELETE FROM "Sessions" WHERE refreshed_at < current_timestamp - interval \'30 minutes\'');
    $stmt->execute();
  }

  private function returnVerifiedSession(?Session $session): ?Session {
    if ($session == null) return null;

    if ($session->isExpired()) {
      $this->deleteSession($session);
      return null;
    }

    return $this->refreshSession($session);
  }

  private function statementToSession(PDOStatement $stmt): ?Session {
    $token = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($token == false) {
      return null;
    }

    return new Session(
      $token['id'],
      $token['user_id'],
      $token['token'],
      strtotime($token['created_at']),
      strtotime($token['refreshed_at'])
    );
  }
}
