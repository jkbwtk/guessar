<?php

require_once 'AppController.php';
require_once __DIR__ . '/../models/View.php';
require_once __DIR__ . '/../repository/ViewRepository.php';

class ViewController extends AppController {
  private $viewRepository;

  public function __construct() {
    parent::__construct();
    $this->viewRepository = new ViewRepository();
  }

  public function getRandomView() {
    header('Content-Type: application/json');

    if (!$this->isGet()) {
      http_response_code(405);
      die(json_encode(['message' => 'Method not allowed']));
    }

    try {
      $view = $this->viewRepository->getRandomView();
      if ($view == null) {
        throw new Exception("View not found", 1);
      }

      $neighbors = $this->viewRepository->getNeighbors($view->getNeighbors(), 5);

      $response = [
        'data' => [
          'target' => $view->toObject(),
          'neighbors' => array_map(function ($neighbor) {
            return $neighbor->toObject();
          }, $neighbors)
        ]
      ];

      return print(json_encode($response));
    } catch (\Throwable $th) {
      http_response_code(500);
      die(json_encode([
        'error' => 'Internal server error'
      ]));
    }
  }
}
