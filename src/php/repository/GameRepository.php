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
    $stmt = $this->database->getConnection()->prepare('UPDATE "Games" SET final_score = :final_score, final_time = :final_time WHERE uniqid = :uniqid');

    $stmt->execute([
      'final_score' => $game->getFinalScore(),
      'final_time' => $game->getFinalTime(),
      // 'final_rounds' => json_encode($game->getFinalRounds()),
      'uniqid' => $game->getUniqid(),
    ]);

    return $this->getGameByUniqid($game->getUniqid());
  }

  public function deleteOldGamesAndRounds(): void {
    $stmt = $this->database->getConnection()->prepare('SELECT delete_old_games_and_rounds()');

    $stmt->execute();
  }

  private function statementToGame(PDOStatement $stmt): ?Game {
    $token = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($token == false) {
      return null;
    }

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