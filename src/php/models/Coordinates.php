<?php


class Coordinates {
  private float $x;
  private float $y;


  public function __construct(float $x, float $y) {
    $this->x = $x;
    $this->y = $y;
  }

  public static function fromUncheckedValues(?float $x, ?float $y): ?Coordinates {
    if ($x === null || $y === null)
      return null;

    return new Coordinates($x, $y);
  }

  public function getX(): float {
    return $this->x;
  }

  public function getY(): float {
    return $this->y;
  }

  public function distanceTo(Coordinates $other): float {
    $x = $this->x - $other->x;
    $y = $this->y - $other->y;
    return sqrt($x * $x + $y * $y);
  }

  public function toObject(bool $verbose = true): array {
    return [
      'x' => $this->x,
      'y' => $this->y
    ];
  }

  public function toJSON(bool $verbose = false): string {
    return json_encode($this->toObject());
  }
}