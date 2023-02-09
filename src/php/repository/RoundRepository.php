<?php

require_once 'Repository.php';
require_once __DIR__ . '/../models/Round.php';
require_once __DIR__ . '/../models/Coordinates.php';


class RoundRepository extends Repository {
  public function getNextRound(string $uniqid): ?Round {
    $round = $this->getNextUnfinishedRound($uniqid);

    return $round;
  }

  public function getRoundByNumber(string $uniqid, int $roundNumber): ?Round {
    $stmt = $this->database->getConnection()->prepare('SELECT * FROM "Rounds"
      LEFT JOIN "Views" ON "Rounds".target_uuid = "Views".uuid
      WHERE game_uniqid = :uniqid AND round_number = :roundNumber
      LIMIT 1
    ');

    $stmt->execute([
      'uniqid' => $uniqid,
      'roundNumber' => $roundNumber,
    ]);

    return $this->statementToRound($stmt);
  }

  private function getNextUnfinishedRound(string $uniqid): ?Round {
    $stmt = $this->database->getConnection()->prepare('SELECT * FROM "Rounds"
      LEFT JOIN "Views" ON "Rounds".target_uuid = "Views".uuid
      WHERE game_uniqid = :uniqid AND ended_at IS NULL
      ORDER BY round_number ASC
      LIMIT 1');

    $stmt->execute([
      'uniqid' => $uniqid,
    ]);

    return $this->statementToRound($stmt);
  }

  public function createRound(Round $round): ?Round {
    $stmt = $this->database->getConnection()->prepare('INSERT INTO "Rounds" (game_uniqid, round_number, target_uuid)
      VALUES (:game_uniqid, :round_number, :target_uuid)
    ');

    $stmt->execute([
      'game_uniqid' => $round->getGameUniqid(),
      'round_number' => $round->getRoundNumber(),
      'target_uuid' => $round->getTargetUuid(),
    ]);

    return $this->getRoundByNumber($round->getGameUniqid(), $round->getRoundNumber());
  }

  public function finishRound(Round $round): ?Round {
    $stmt = $this->database->getConnection()->prepare('UPDATE "Rounds"
      SET guess_coordinates_x = :guess_coordinates_x, guess_coordinates_y = :guess_coordinates_y, updated_at = NOW(), ended_at = NOW()
      WHERE id = :id
    ');

    $stmt->execute([
      'guess_coordinates_x' => $round->getGuessCoordinates()->getX(),
      'guess_coordinates_y' => $round->getGuessCoordinates()->getY(),
      'id' => $round->getId(),
    ]);

    return $this->getRoundByNumber($round->getGameUniqid(), $round->getRoundNumber());
  }

  public function getNumberOfRounds(string $uniqid): int {
    $stmt = $this->database->getConnection()->prepare('SELECT COUNT(*) FROM "Rounds"
      WHERE game_uniqid = :uniqid
    ');

    $stmt->execute([
      'uniqid' => $uniqid,
    ]);

    return $stmt->fetch(PDO::FETCH_NUM)[0];
  }

  public function getAllRoundsByUniqid(string $uniqid): array {
    $stmt = $this->database->getConnection()->prepare('SELECT * FROM "Rounds"
      LEFT JOIN "Views" ON "Rounds".target_uuid = "Views".uuid
      WHERE game_uniqid = :uniqid
      ORDER BY round_number ASC
    ');

    $stmt->execute([
      'uniqid' => $uniqid,
    ]);

    return $this->statementToRounds($stmt);
  }

  private function statementToRound(PDOStatement $stmt): ?Round {
    $token = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($token === false) {
      return null;
    }

    return $this->mapArrayToRound($token);
  }

  private function statementToRounds(PDOStatement $stmt): array {
    $tokens = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if ($tokens === false) {
      return [];
    }

    $rounds = [];

    foreach ($tokens as $token) {
      $rounds[] = $this->mapArrayToRound($token);
    }

    return $rounds;
  }

  private function mapArrayToRound(array $token): Round {
    return new Round(
      $token['id'],
      $token['game_uniqid'],
      $token['round_number'],
      $token['target_uuid'],
      new Coordinates($token['position_x'], $token['position_y']),
      $token['guess_coordinates_x'] === null ? null : new Coordinates($token['guess_coordinates_x'], $token['guess_coordinates_y']),
      strtotime($token['created_at']),
      $token['updated_at'] !== null ? strtotime($token['updated_at']) : null,
      $token['ended_at'] !== null ? strtotime($token['ended_at']) : null,
    );
  }
}