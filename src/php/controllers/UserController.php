<?php

require_once 'AppController.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../repository/UserRepository.php';

class UserController extends AppController {
  public function getUser() {
    header('Content-Type: application/json');

    $sessionUser = $this->getUserFromCookie();
    if ($sessionUser === null) $this->throwNotAuthorized();

    http_response_code(200);
    return print(json_encode([
      'user' => $sessionUser->toObject(),
    ]));
  }
}
