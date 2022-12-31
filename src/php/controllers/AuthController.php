<?php

require_once 'AppController.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/Session.php';

class AuthController extends AppController {
  public function login() {
    $sessionUser = $this->getUserFromCookie();
    if ($sessionUser !== null) $this->redirect('/');

    $this->render('login');
  }

  public function register() {
    $sessionUser = $this->getUserFromCookie();
    if ($sessionUser !== null) $this->redirect('/');

    $this->render('register');
  }

  public function apiRegister() {
    header('Content-Type: application/json');

    try {
      $userRaw = json_decode(file_get_contents('php://input'), true);
      if (!$this->validateRegistrationData($userRaw)) throw new Exception('How did I get here?');

      $user = User::NewUser(
        $userRaw['username'],
        $userRaw['email'],
        $userRaw['password']
      );

      $createdUser = $this->userRepository->createUser($user);
      if ($createdUser === null) throw new Exception('User creation failed', 3471);

      $session = Session::NewSession($createdUser->getId());
      $createdSession = $this->sessionRepository->createSession($session);
      if ($createdSession === null) throw new Exception('Session creation failed', 3471);


      $this->setAuthCookie($createdSession);

      http_response_code(201);
      return print(json_encode([
        'status' => 201,
        'message' => 'User created successfully',
        'user' => $createdUser->toObject()
      ]));
    } catch (\Throwable $e) {
      switch ($e->getCode()) {
        case 3470:
          return $this->throwValidationError(31);
        case 3472:
          return $this->throwValidationError(13);

        default:
          return $this->throwGenericError();
      }
    }
  }

  public function apiLogin() {
    header('Content-Type: application/json');

    try {
      $userRaw = json_decode(file_get_contents('php://input'), true);
      if (!$this->validateLoginData($userRaw)) throw new Exception('How did I get here?');

      $user = $this->userRepository->getUserByEmail($userRaw['email']);
      if ($user === null) $this->throwAuthError(10);

      if (!$user->validatePassword($userRaw['password'])) $this->throwAuthError(10);

      $sessionUser = $this->getUserFromCookie();
      if ($sessionUser !== null && $sessionUser->getId() === $user->getId()) {
        http_response_code(200);
        return print(json_encode([
          'status' => 200,
          'message' => 'User already logged in',
          'user' => $sessionUser->toObject()
        ]));
      }

      $session = Session::NewSession($user->getId());
      $createdSession = $this->sessionRepository->createSession($session);
      if ($createdSession === null) throw new Exception('Session creation failed', 3471);


      $this->setAuthCookie($createdSession);
      http_response_code(200);
      return print(json_encode([
        'status' => 200,
        'message' => 'User logged in successfully',
        'user' => $user->toObject()
      ]));
    } catch (\Throwable $e) {
      switch ($e->getCode()) {
        default:
          return $this->throwGenericError();
      }
    }
  }

  public function apiLogout() {
    header('Content-Type: application/json');

    try {
      if (!isset($_COOKIE['GSESSIONID'])) $this->throwAuthError(20);

      $session = $this->sessionRepository->getSessionByToken($_COOKIE['GSESSIONID']);
      if ($session === null) $this->throwAuthError(21);

      $this->sessionRepository->deleteSession($session);
      $this->unsetAuthCookie();

      http_response_code(200);
      return print(json_encode([
        'status' => 200,
        'message' => 'User logged out successfully'
      ]));
    } catch (\Throwable $e) {
      switch ($e->getCode()) {
        default:
          return $this->throwGenericError();
      }
    }
  }

  private function validateRegistrationData(?array $user): bool {
    if ($user === null) $this->throwValidationError(0);

    if (
      !isset($user['username']) ||
      !isset($user['email']) ||
      !isset($user['password'])
    ) {
      $this->throwValidationError(1);
    }

    if (strlen($user['username']) < 3) {
      $this->throwValidationError(10);
    }

    if (strlen($user['username']) > 32) {
      $this->throwValidationError(11);
    }

    if (!preg_match('/^[a-zA-Z0-9!@#$%^&*()\-+<>?:;"\'\[\]{}`~=_\+\/,\.]+$/', $user['username'])) {
      $this->throwValidationError(12);
    }


    if (strlen($user['password']) < 8) {
      $this->throwValidationError(20);
    }

    if (strlen($user['password']) > 64) {
      $this->throwValidationError(21);
    }

    if (!preg_match('/^[a-zA-Z0-9!@#$%^&*()\-+<>?:;"\'\[\]{}`~\=_\+\/,\.]+$/', $user['password'])) {
      $this->throwValidationError(22);
    }

    if (!preg_match('/[A-Z]/', $user['password'])) {
      $this->throwValidationError(23);
    }

    if (!preg_match('/[a-z]/', $user['password'])) {
      $this->throwValidationError(24);
    }

    if (!preg_match('/[0-9]/', $user['password'])) {
      $this->throwValidationError(25);
    }


    if (!filter_var($user['email'], FILTER_VALIDATE_EMAIL)) {
      $this->throwValidationError(30);
    }


    return true;
  }

  private function validateLoginData(?array $user): bool {
    if ($user === null) $this->throwValidationError(0);

    if (
      !isset($user['email']) ||
      !isset($user['password'])
    ) {
      $this->throwValidationError(1);
    }

    if (!filter_var($user['email'], FILTER_VALIDATE_EMAIL)) {
      $this->throwValidationError(30);
    }

    if (strlen($user['password']) < 8) {
      $this->throwValidationError(20);
    }

    if (strlen($user['password']) > 64) {
      $this->throwValidationError(21);
    }

    return true;
  }

  private function throwValidationError(int $code) {
    $validationMessages = [
      0 => 'Bad request',
      1 => 'Missing required fields',
      10 => 'Username must be at least 3 characters long',
      11 => 'Username must be shorter than 32 characters',
      12 => 'Username must contain only letters, numbers and special characters',
      13 => 'Username too popular',
      20 => 'Password must be at least 8 characters long',
      21 => 'Password must be shorter than 64 characters',
      22 => 'Password must contain only letters, numbers and special characters',
      23 => 'Password must contain at least one uppercase letter',
      24 => 'Password must contain at least one lowercase letter',
      25 => 'Password must contain at least one number',
      30 => 'Invalid email',
      31 => 'Email already taken'
    ];

    AppController::throwVerboseError(400, $code, $validationMessages);
  }

  private function throwAuthError(int $code) {
    $authMessages = [
      0 => 'Bad request',
      10 => 'Invalid email or password',
      20 => 'Not logged in',
      21 => 'Invalid session token'
    ];

    AppController::throwVerboseError(401, $code, $authMessages);
  }

  private function setAuthCookie(Session $session) {
    setcookie('GSESSIONID', $session->getToken(), $session->expiresAt(), '/', '', false, true);
  }

  private function unsetAuthCookie() {
    setcookie('GSESSIONID', '', time() - 60, '/', '', false, true);
  }
}
