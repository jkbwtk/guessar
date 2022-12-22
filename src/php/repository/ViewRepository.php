<?php

require_once 'Repository.php';
require_once __DIR__ . '/../models/View.php';

class ViewRepository extends Repository {

  public function getView(string $uuid): ?View {
    $stmt = $this->database->getConnection()->prepare('SELECT *, array_to_json("neighbors") as neighbors FROM "Views" WHERE uuid = :uuid');
    $stmt->bindParam(':uuid', $uuid, PDO::PARAM_STR);
    $stmt->execute();

    return $this->statementToView($stmt);
  }

  public function getRandomView(): ?View {
    $stmt = $this->database->getConnection()->prepare('SELECT *, array_to_json("neighbors") as neighbors FROM "Views" ORDER BY random() LIMIT 1');
    $stmt->execute();

    return $this->statementToView($stmt);
  }

  public function getNeighbors(array $neighbors, int $levels): array {
    $views = [];
    $visited = [];

    $this->crawl($neighbors, $levels, 1, $views, $visited);

    return $views;
  }

  public function getClosest(float $x, float $y): ?View {
    $stmt = $this->database->getConnection()->prepare('SELECT *, array_to_json("neighbors") as neighbors FROM "Views" ORDER BY (position_x - :x) * (position_x - :x) + (position_y - :y) * (position_y - :y) LIMIT 1');
    $stmt->bindParam(':x', $x, PDO::PARAM_STR);
    $stmt->bindParam(':y', $y, PDO::PARAM_STR);
    $stmt->execute();

    return $this->statementToView($stmt);
  }

  private function crawl(array $neighbors, int $levels, int $level, array &$views, array &$visited): void {
    if ($level > $levels) return;

    foreach ($neighbors as $neighbor) {
      if (in_array($neighbor, $visited)) continue;

      $stmt = $this->database->getConnection()->prepare('SELECT *, array_to_json("neighbors") as neighbors FROM "Views" WHERE uuid = :uuid');
      $stmt->bindParam(':uuid', $neighbor, PDO::PARAM_INT);
      $stmt->execute();

      $view = $stmt->fetch(PDO::FETCH_ASSOC);

      if ($view != false) {
        $exists = false;

        foreach ($views as $v) {
          if ($v->getUUID() == $neighbor) {
            $exists = true;
            break;
          }
        }

        if (!$exists) {
          $visited[] = $neighbor;

          $view = new View(
            $view['uuid'],
            $view['position_x'],
            $view['position_y'],
            $view['position_z'],
            $view['position_rad'],
            $view['in_vehicle'],
            $view['weather_region'],
            $view['weather_old'],
            $view['weather_new'],
            $view['wavyness'],
            $view['time_hours'],
            $view['time_minutes'],
            $view['quaternion_x'],
            $view['quaternion_y'],
            $view['quaternion_z'],
            $view['quaternion_w'],
            json_decode($view['neighbors'])
          );

          $views[] = $view;

          $this->crawl($view->getNeighbors(), $levels, $level + 1, $views, $visited);
        }
      }
    }
  }

  private function statementToView(PDOStatement $stmt): ?View {
    $view = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($view == false) {
      return null;
    }

    return new View(
      $view['uuid'],
      $view['position_x'],
      $view['position_y'],
      $view['position_z'],
      $view['position_rad'],
      $view['in_vehicle'],
      $view['weather_region'],
      $view['weather_old'],
      $view['weather_new'],
      $view['wavyness'],
      $view['time_hours'],
      $view['time_minutes'],
      $view['quaternion_x'],
      $view['quaternion_y'],
      $view['quaternion_z'],
      $view['quaternion_w'],
      json_decode($view['neighbors'])
    );
  }
}
