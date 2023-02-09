<?php

require_once 'Repository.php';
require_once __DIR__ . '/../models/Game.php';

class GameRepository extends Repository {
  public function getGameByUniqid(string $uniqid): ?Game {
    $stmt = $this->database->getConnection()->prepare('SELECT * FROM "Games" WHERE uniqid = :uniqid LIMIT 1');
    $stmt->bindParam(':uniqid', $uniqid, PDO::PARAM_STR);
    $stmt->execute();

    return $this->statementToGame($stmt);
  }

  public function createGame(Game $game): ?Game {
    $stmt = $this->database->getConnection()->prepare('INSERT INTO "Games" (uniqid, user_id, settings, time_limit, rounds)
      VALUES (:uniqid, :user_id, :settings, :time_limit, :rounds)
    ');

    $stmt->execute([
      'uniqid' => $game->getUniqid(),
      'user_id' => $game->getUserId(),
      'settings' => $game->getSettings(),
      'time_limit' => $game->getTimeLimit(),
      'rounds' => $game->getRounds(),
    ]);

    return $this->getGameByUniqid($game->getUniqid());
  }

  public function finishGame(Game $game): ?Game {
    $stmt = $this->database->getConnection()->prepare('UPDATE "Games" 
    SET 
      final_score = :final_score,
      final_time = :final_time,
      ended_at = NOW()
    WHERE uniqid = :uniqid');

    $stmt->execute([
      'final_score' => $game->getFinalScore(),
      'final_time' => $game->getFinalTime(),
      // 'final_rounds' => json_encode($game->getFinalRounds()),
      'uniqid' => $game->getUniqid(),

    ]);

    return $this->getGameByUniqid($game->getUniqid());
  }

  public function getTopGames(int $limit): array {
    $stmt = $this->database->getConnection()->prepare('SELECT * FROM "Games"
    WHERE final_score IS NOT NULL

    ORDER BY final_score DESC, final_time ASC, settings ASC, created_at DESC
    LIMIT :limit');
    $stmt->execute([
      'limit' => $limit,
    ]);

    return $this->statementToGames($stmt);
  }

  public function deleteOldGamesAndRounds(): void {
    $stmt = $this->database->getConnection()->prepare('SELECT delete_old_games_and_rounds()');

    $stmt->execute();
  }

  public function deleteGameByUniqid(string $uniqid): void {
    $stmt = $this->database->getConnection()->prepare('DELETE FROM "Games" WHERE uniqid = :uniqid');

    $stmt->execute([
      'uniqid' => $uniqid,
    ]);

    $stmt = $this->database->getConnection()->prepare('DELETE FROM "Rounds" WHERE game_uniqid = :uniqid');

    $stmt->execute([
      'uniqid' => $uniqid,
    ]);
  }

  private function statementToGame(PDOStatement $stmt): ?Game {
    $token = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($token === false) {
      return null;
    }

    return $this->mapArrayToGame($token);
  }

  private function statementToGames(PDOStatement $stmt): array {
    $tokens = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if ($tokens === false) {
      return [];
    }

    $games = [];

    foreach ($tokens as $token) {
      $games[] = $this->mapArrayToGame($token);
    }

    return $games;
  }

  private function mapArrayToGame(array $token): Game {
    return new Game(
      $token['uniqid'],
      $token['user_id'],
      $token['settings'],
      $token['time_limit'],
      $token['rounds'],
      $token['final_score'],
      $token['final_time'],
      // $token['final_rounds'],
      strtotime($token['created_at'])
    );
  }
}