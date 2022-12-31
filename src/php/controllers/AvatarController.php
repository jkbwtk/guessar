<?php

require_once 'AppController.php';
require_once __DIR__ . '/../models/Avatar.php';
require_once __DIR__ . '/../repository/AvatarRepository.php';

class AvatarController extends AppController {
  private AvatarRepository $avatarRepository;

  public function __construct() {
    parent::__construct();
    $this->avatarRepository = new AvatarRepository();
  }

  public function uploadAvatar() {
    header('Content-Type: application/json');

    $sessionUser = $this->getUserFromCookie();
    if ($sessionUser === null) $this->throwNotAuthorized();

    try {
      if (!$this->validateAvatar()) throw new Exception('How did I get here?');

      $avatarData = file_get_contents($_FILES['avatar']['tmp_name']);

      $avatar = Avatar::NewAvatar(
        $sessionUser->getId(),
        $_FILES['avatar']['type'],
        $avatarData
      );

      $currentAvatar = $this->avatarRepository->getAvatarByUserId($sessionUser->getId());

      if ($currentAvatar !== null) {
        $currentAvatar->setMime($avatar->getMime());
        $currentAvatar->setImage($avatar->getImage());

        $createdAvatar = $this->avatarRepository->updateAvatar($currentAvatar);
      } else $createdAvatar = $this->avatarRepository->createAvatar($avatar);

      if ($createdAvatar === null) new Exception('Failed to create avatar', 231);


      http_response_code(201);
      return print(json_encode([
        'status' => 201,
        'message' => 'Avatar uploaded successfully',
        'avatar' => $createdAvatar->getId(),
      ]));
    } catch (\Throwable $e) {
      switch ($e->getCode()) {
        default:
          return $this->throwGenericError();
      }
    }
  }

  public function getAvatar() {
    if (!isset($_GET['id'])) $this->throwValidationError(0);
    $id = $_GET['id'];

    $avatar = $this->avatarRepository->getAvatarById($id);
    if ($avatar === null) $this->throwNotFound();

    header('Content-Type: ' . $avatar->getMime());
    header('Content-Length: ' . strlen($avatar->getImage()));

    return print($avatar->getImage());
  }

  public function deleteAvatar() {
    header('Content-Type: application/json');

    $sessionUser = $this->getUserFromCookie();
    if ($sessionUser === null) $this->throwNotAuthorized();

    try {
      $currentAvatar = $this->avatarRepository->getAvatarByUserId($sessionUser->getId());
      if ($currentAvatar === null) $this->throwNotFound();

      $this->avatarRepository->deleteAvatar($currentAvatar);

      http_response_code(200);
      return print(json_encode([
        'status' => 200,
        'message' => 'Avatar deleted successfully',
      ]));
    } catch (\Throwable $e) {
      switch ($e->getCode()) {
        default:
          return $this->throwGenericError();
      }
    }
  }

  private function validateAvatar(): bool {
    if (!isset($_FILES['avatar'])) $this->throwValidationError(0);

    $avatar = $_FILES['avatar'];
    if ($avatar['size'] > 1024 * 512) $this->throwValidationError(1);

    $allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
    if (!in_array($avatar['type'], $allowedTypes)) $this->throwValidationError(2);

    return true;
  }

  private function throwValidationError(int $code) {
    $validationMessages = [
      0 => 'Bad request',
      1 => 'File too large',
      2 => 'File type not allowed',
    ];

    AppController::throwVerboseError(400, $code, $validationMessages);
  }
}
