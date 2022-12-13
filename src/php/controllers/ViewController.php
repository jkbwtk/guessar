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

  public function getView() {
    header('Content-Type: application/json');

    $this->enforceRequestMethod('isGet');

    try {
      if (!isset($_GET['uuid'])) {
        throw new Exception('UUID is not set');
      }

      $uuid = $_GET['uuid'];
      $exp = "/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/";

      if (!preg_match($exp, $uuid)) {
        throw new Exception('Invalid UUID', 2);
      }

      $view = $this->viewRepository->getView($_GET['uuid']);
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
    } catch (\Throwable $e) {
      $this->throwGenericError();
    }
  }

  public function getRandomView() {
    header('Content-Type: application/json');

    $this->enforceRequestMethod('isGet');

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
      $this->throwGenericError();
    }
  }
}
