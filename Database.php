<?php

class Database {
  private static $instance = null;
  private $connection;

  private $username;
  private $password;
  private $host;
  private $database;

  public function __construct() {
    $this->username = getenv('DB_USERNAME');
    $this->password = getenv('DB_PASSWORD');
    $this->host = getenv('DB_HOST');
    $this->database = getenv('DB_DATABASE');

    $this->connection = $this->connect();
  }

  private function connect(): PDO {
    try {
      $conn = new PDO(
        "pgsql:host=$this->host;port=5432;dbname=$this->database",
        $this->username,
        $this->password,
        ["sslmode"  => "prefer"]
      );

      $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
      return $conn;
    } catch (PDOException $e) {
      // die("Connection failed: " . $e->getMessage());
      die();
    }
  }

  public static function getInstance(): Database {
    if (self::$instance == null) {
      self::$instance = new Database();
    }

    return self::$instance;
  }

  public function getConnection(): PDO {
    return $this->connection;
  }
}
