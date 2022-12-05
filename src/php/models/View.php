<?php


class View {
  private string $uuid;
  private float $position_x;
  private float $position_y;
  private float $position_z;
  private float $position_rad;
  private int $in_vehicle;
  private int $weather_region;
  private int $weather_old;
  private int $weather_new;
  private float $wavyness;
  private int $time_hours;
  private int $time_minutes;
  private float $quaternion_x;
  private float $quaternion_y;
  private float $quaternion_z;
  private float $quaternion_w;
  private array $neighbors;


  public function __construct(
    string $uuid,
    float $position_x,
    float $position_y,
    float $position_z,
    float $position_rad,
    int $in_vehicle,
    int $weather_region,
    int $weather_old,
    int $weather_new,
    float $wavyness,
    int $time_hours,
    int $time_minutes,
    float $quaternion_x,
    float $quaternion_y,
    float $quaternion_z,
    float $quaternion_w,
    array $neighbors
  ) {
    $this->uuid = $uuid;
    $this->position_x = $position_x;
    $this->position_y = $position_y;
    $this->position_z = $position_z;
    $this->position_rad = $position_rad;
    $this->in_vehicle = $in_vehicle;
    $this->weather_region = $weather_region;
    $this->weather_old = $weather_old;
    $this->weather_new = $weather_new;
    $this->wavyness = $wavyness;
    $this->time_hours = $time_hours;
    $this->time_minutes = $time_minutes;
    $this->quaternion_x = $quaternion_x;
    $this->quaternion_y = $quaternion_y;
    $this->quaternion_z = $quaternion_z;
    $this->quaternion_w = $quaternion_w;
    $this->neighbors = $neighbors;
  }

  public function getUuid(): string {
    return $this->uuid;
  }

  public function getPositionX(): float {
    return $this->position_x;
  }

  public function getPositionY(): float {
    return $this->position_y;
  }

  public function getPositionZ(): float {
    return $this->position_z;
  }

  public function getPositionRad(): float {
    return $this->position_rad;
  }

  public function getInVehicle(): int {
    return $this->in_vehicle;
  }

  public function getWeatherRegion(): int {
    return $this->weather_region;
  }

  public function getWeatherOld(): int {
    return $this->weather_old;
  }

  public function getWeatherNew(): int {
    return $this->weather_new;
  }

  public function getWavyness(): float {
    return $this->wavyness;
  }

  public function getTimeHours(): int {
    return $this->time_hours;
  }

  public function getTimeMinutes(): int {
    return $this->time_minutes;
  }

  public function getQuaternionX(): float {
    return $this->quaternion_x;
  }

  public function getQuaternionY(): float {
    return $this->quaternion_y;
  }

  public function getQuaternionZ(): float {
    return $this->quaternion_z;
  }

  public function getQuaternionW(): float {
    return $this->quaternion_w;
  }

  public function getNeighbors(): array {
    return $this->neighbors;
  }

  public function setUUID(string $uuid): void {
    $this->uuid = $uuid;
  }

  public function setPositionX(float $position_x): void {
    $this->position_x = $position_x;
  }

  public function setPositionY(float $position_y): void {
    $this->position_y = $position_y;
  }

  public function setPositionZ(float $position_z): void {
    $this->position_z = $position_z;
  }

  public function setPositionRad(float $position_rad): void {
    $this->position_rad = $position_rad;
  }

  public function setInVehicle(int $in_vehicle): void {
    $this->in_vehicle = $in_vehicle;
  }

  public function setWeatherRegion(int $weather_region): void {
    $this->weather_region = $weather_region;
  }

  public function setWeatherOld(int $weather_old): void {
    $this->weather_old = $weather_old;
  }

  public function setWeatherNew(int $weather_new): void {
    $this->weather_new = $weather_new;
  }

  public function setWavyness(float $wavyness): void {
    $this->wavyness = $wavyness;
  }

  public function setTimeHours(int $time_hours): void {
    $this->time_hours = $time_hours;
  }

  public function setTimeMinutes(int $time_minutes): void {
    $this->time_minutes = $time_minutes;
  }

  public function setQuaternionX(float $quaternion_x): void {
    $this->quaternion_x = $quaternion_x;
  }

  public function setQuaternionY(float $quaternion_y): void {
    $this->quaternion_y = $quaternion_y;
  }

  public function setQuaternionZ(float $quaternion_z): void {
    $this->quaternion_z = $quaternion_z;
  }

  public function setQuaternionW(float $quaternion_w): void {
    $this->quaternion_w = $quaternion_w;
  }

  public function setNeighbors(array $neighbors): void {
    $this->neighbors = $neighbors;
  }

  public function toObject() {
    return [
      'uuid' => $this->uuid,
      'position' => [
        'x' => $this->position_x,
        'y' => $this->position_y,
        'z' => $this->position_z,
        'r' => $this->position_rad
      ],
      'in_vehicle' => $this->in_vehicle,
      'weather' => [
        'region' => $this->weather_region,
        'old' => $this->weather_old,
        'new' => $this->weather_new,
      ],
      'wavyness' => $this->wavyness,
      'time' => [
        'hours' => $this->time_hours,
        'minutes' => $this->time_minutes
      ],
      'quaternion' => [
        'x' => $this->quaternion_x,
        'y' => $this->quaternion_y,
        'z' => $this->quaternion_z,
        'w' => $this->quaternion_w
      ],
      'neighbors' => $this->neighbors
    ];
  }

  public function toJSON(): string {
    return json_encode($this->toObject());
  }
}
