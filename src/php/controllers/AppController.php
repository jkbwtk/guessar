<?php

require_once __DIR__ . '/../repository/UserRepository.php';
require_once __DIR__ . '/../repository/SessionRepository.php';

class AppController {
  private $request;

  protected UserRepository $userRepository;
  protected SessionRepository $sessionRepository;

  public function __construct() {
    $this->request = $_SERVER['REQUEST_METHOD'];

    $this->userRepository = new UserRepository();
    $this->sessionRepository = new SessionRepository();
  }

  protected function isGet(): bool {
    return $this->request === 'GET';
  }

  protected function isPost(): bool {
    return $this->request === 'POST';
  }

  protected function isPut(): bool {
    return $this->request === 'PUT';
  }

  protected function isDelete(): bool {
    return $this->request === 'DELETE';
  }

  protected function enforceRequestMethod(string $validator): void {
    if (!$this->$validator()) {
      http_response_code(405);
      die(json_encode(['message' => 'Method not allowed']));
    }
  }

  protected function render(string $template = null, array $variables = []) {
    $sessionUser = $this->getUserFromCookie();

    $templatePath = 'public/views/' . $template . '.php';
    $output = self::get404View($sessionUser);

    if (file_exists($templatePath)) {
      extract($variables);

      ob_start();
      include $templatePath;
      $output = ob_get_clean();
    }
    print $output;
  }

  public static function get404View(User $sessionUser = null) {
    ob_start();

    include_once 'public/views/404.php';
    $output = ob_get_clean();

    return $output;
  }

  public static function throwNotAuthorized() {
    header('Content-Type: application/json');
    http_response_code(401);
    die(json_encode([
      'status' => 401,
      'message' => 'Not authorized'
    ]));
  }

  public static function throwNotFound() {
    header('Content-Type: application/json');
    http_response_code(404);
    die(json_encode([
      'status' => 404,
      'message' => 'Not found'
    ]));
  }

  public static function throwNotAllowed() {
    header('Content-Type: application/json');
    http_response_code(405);
    die(json_encode([
      'status' => 405,
      'message' => 'Method not allowed'
    ]));
  }

  public static function throwGenericError() {
    header('Content-Type: application/json');
    http_response_code(500);
    die(json_encode([
      'status' => 500,
      'message' => 'Internal server error'
    ]));
  }

  public static function throwVerboseError(int $status, int $code, array $errorMessages): void {
    header('Content-Type: application/json');
    http_response_code($status);

    die(json_encode([
      'status' => $status,
      'message' => $errorMessages[$code] ?? 'Unknown error',
      'errorCode' => $code,
    ]));
  }

  protected function redirect(string $path) {
    header('Location: ' . $path);
    die();
  }

  protected function getUserFromCookie(): ?User {
    if (isset($_COOKIE['GSESSIONID'])) {
      $session = $this->sessionRepository->getSessionByToken($_COOKIE['GSESSIONID']);
      if ($session !== null) {
        $sessionUser = $this->userRepository->getUserById($session->getUserId());
        return $sessionUser;
      }
    }

    return null;
  }

  protected function setUserCookie(User $user) {
    setcookie('GUSER', $user->toJSON(), 0, '/');
  }

  protected function unsetUserCookie() {
    setcookie('GUSER', '', 0, '/');
  }

  protected function sendUserCookie() {
    $sessionUser = $this->getUserFromCookie();

    if ($sessionUser !== null) {
      $this->setUserCookie($sessionUser);
    } else {
      $this->unsetUserCookie();
    }
  }
}
