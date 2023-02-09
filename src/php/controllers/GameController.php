<?php

require_once 'AppController.php';
require_once __DIR__ . '/../models/Game.php';
require_once __DIR__ . '/../models/Round.php';

require_once __DIR__ . '/../repository/GameRepository.php';
require_once __DIR__ . '/../repository/RoundRepository.php';
require_once __DIR__ . '/../repository/ViewRepository.php';

class GameController extends AppController {
  private GameRepository $gameRepository;
  private RoundRepository $roundRepository;
  private ViewRepository $viewRepository;

  public function __construct() {
    parent::__construct();
    $this->gameRepository = new GameRepository();
    $this->roundRepository = new RoundRepository();
    $this->viewRepository = new ViewRepository();
  }

  public function gameStart() {
    $this->sendUserCookie();
    $this->render('game');
  }

  public function game(array $params) {
    if (isset($params['uniqid'])) {
      $uniqid = $params['uniqid'];
      $game = $this->gameRepository->getGameByUniqid($uniqid);

      $sessionUser = $this->getUserFromCookie();
      $userId = $sessionUser ? $sessionUser->getId() : null;

      if ($game === null || $game->getUserId() !== $userId) {
        $this->redirect('/game');
      }
    }

    $this->sendUserCookie();
    $this->render('game');
  }

  public function getGame(array $params) {
    header('Content-Type: application/json');

    if (!isset($params['uniqid'])) {
      http_response_code(400);
      print(json_encode(['message' => 'Uniqid is required']));
      return;
    }

    $uniqid = $params['uniqid'];
    $game = $this->gameRepository->getGameByUniqid($uniqid);
    if ($game === null) {
      http_response_code(404);
      print(json_encode(['message' => 'Game not found']));
      return;
    }

    print($game->toJSON());
  }

  public function startGame() {
    header('Content-Type: application/json');

    $sessionUser = $this->getUserFromCookie();
    $userId = $sessionUser ? $sessionUser->getId() : null;

    try {
      $settings = json_decode(file_get_contents('php://input'), true);
      if (!$this->validateGameSettings($settings))
        throw new Exception('How did I get here?');

      $bitSettings = 0;

      if ($settings['allowMove'])
        $bitSettings += 1;
      if ($settings['allowPan'])
        $bitSettings += 2;
      if ($settings['allowZoom'])
        $bitSettings += 4;

      $game = Game::NewGame(
        $userId,
        $bitSettings,
        $settings['roundTime'],
        6
      );

      $createdGame = $this->gameRepository->createGame($game);


      print($createdGame->toJSON());
    } catch (\Throwable $e) {
      switch ($e->getCode()) {
        default:
          return $this->throwGenericError();
      }
    }
  }

  public function getRound(array $params) {
    header('Content-Type: application/json');

    if (!isset($params['uniqid']))
      $this->throwValidationError(0);

    $uniqid = $params['uniqid'];

    try {
      $sessionUser = $this->getUserFromCookie();
      $userId = $sessionUser ? $sessionUser->getId() : null;

      $game = $this->gameRepository->getGameByUniqid($uniqid);
      if ($game === null)
        throw new Exception('Game not found', 404);

      if ($game->getUserId() !== $userId)
        $this->throwNotAuthorized();


      $round = $this->roundRepository->getNextRound($uniqid);
      if ($round === null) {
        $roundNumber = $this->roundRepository->getNumberOfRounds($uniqid);
        if ($roundNumber >= $game->getRounds())
          $this->throwValidationError(1);

        $targetView = $this->pickRandomTarget($uniqid);

        $createdRound = Round::NewRound(
          $uniqid,
          $roundNumber,
          $targetView->getUuid(),
          new Coordinates($targetView->getPositionX(), $targetView->getPositionY()),
        );

        $round = $this->roundRepository->createRound($createdRound);
        if ($round === null)
          throw new Exception('Could not create round', 500);
      }

      print($round->toJSON());
    } catch (\Throwable $e) {
      switch ($e->getCode()) {
        default:
          return $this->throwGenericError();
      }
    }
  }

  public function getAllRounds(array $params) {
    header('Content-Type: application/json');

    if (!isset($params['uniqid']))
      $this->throwValidationError(0);

    $uniqid = $params['uniqid'];

    try {
      $sessionUser = $this->getUserFromCookie();
      $userId = $sessionUser ? $sessionUser->getId() : null;

      $game = $this->gameRepository->getGameByUniqid($uniqid);
      if ($game === null)
        throw new Exception('Game not found', 404);

      if ($game->getUserId() !== $userId)
        $this->throwNotAuthorized();

      $rounds = $this->roundRepository->getAllRoundsByUniqid($uniqid);
      if ($rounds === null)
        throw new Exception('Could not get rounds', 500);


      $roundsObjects = [];

      foreach ($rounds as $round) {
        if ($round->isFinished())
          $roundsObjects[] = $round->toObject();
      }

      print(json_encode($roundsObjects));
    } catch (\Throwable $e) {
      switch ($e->getCode()) {
        default:
          return $this->throwGenericError();
      }
    }
  }

  public function submitRound(array $params) {
    header('Content-Type: application/json');

    if (!isset($params['uniqid']))
      $this->throwValidationError(0);

    $uniqid = $params['uniqid'];

    try {
      $submission = json_decode(file_get_contents('php://input'), true);
      if (!$this->validateSubmission($submission))
        throw new Exception('How did I get here?');

      $sessionUser = $this->getUserFromCookie();
      $userId = $sessionUser ? $sessionUser->getId() : null;

      $game = $this->gameRepository->getGameByUniqid($uniqid);
      if ($game === null)
        throw new Exception('Game not found', 404);

      if ($game->getUserId() !== $userId)
        $this->throwNotAuthorized();


      $round = $this->roundRepository->getNextRound($uniqid);
      $roundNumber = $this->roundRepository->getNumberOfRounds($uniqid);

      if ($round === null) {
        if ($roundNumber >= $game->getRounds())
          return $this->finishGame($uniqid);
        else
          throw new Exception('Round not found', 404);
      }

      $round->setGuessCoordinates(new Coordinates($submission['x'], $submission['y']));
      $result = $this->roundRepository->finishRound($round);
      if ($result === null)
        throw new Exception('Could not finish round', 500);

      if ($roundNumber >= $game->getRounds())
        $this->finishGame($uniqid);

      print($result->toJSON());
    } catch (\Throwable $e) {
      switch ($e->getCode()) {
        default:
          return $this->throwGenericError();
      }
    }
  }

  private function finishGame(string $uniqid) {
    try {
      $game = $this->gameRepository->getGameByUniqid($uniqid);
      $rounds = $this->roundRepository->getAllRoundsByUniqid($uniqid);

      if ($game === null)
        throw new Exception('Game not found', 500);

      $game->finish($rounds);
      $updatedGame = $this->gameRepository->finishGame($game);

      if ($updatedGame === null)
        throw new Exception('Could not finish game', 500);

      // print($updatedGame->toJSON());
    } catch (\Throwable $e) {
      switch ($e->getCode()) {
        default:
          return $this->throwGenericError();
      }
    }
  }

  private function pickRandomTarget(string $uniqid) {
    $rounds = $this->roundRepository->getAllRoundsByUniqid($uniqid);

    $retryCounter = 0;
    $retryLimit = 100;

    $minimumDistance = 300;


    do {
      $targetView = $this->viewRepository->getRandomView();

      if ($targetView === null)
        throw new Exception('Could not pick random view', 404);

      $targetCoordinates = new Coordinates($targetView->getPositionX(), $targetView->getPositionY());

      $toCloseFlag = false;

      foreach ($rounds as $round) {
        $roundCoordinates = $round->getTargetCoordinates();

        if ($targetCoordinates->distanceTo($roundCoordinates) < $minimumDistance) {
          $toCloseFlag = true;
          break;
        }
      }

      if (!$toCloseFlag)
        break;

      $retryCounter += 1;
    } while ($retryCounter < $retryLimit);

    return $targetView;
  }

  private function getAllUsedTargetUuids(string $uniqid) {
    $rounds = $this->roundRepository->getAllRoundsByUniqid($uniqid);

    $targetUuids = [];
    foreach ($rounds as $round) {
      $targetUuids[] = $round->getTargetUuid();
    }

    return $targetUuids;
  }

  private function validateGameSettings(?array $data): bool {
    if ($data === null)
      $this->throwValidationError(10);

    if (!isset($data['allowPan']))
      $this->throwValidationError(20);

    if (!isset($data['allowZoom']))
      $this->throwValidationError(21);

    if (!isset($data['allowMove']))
      $this->throwValidationError(22);

    if (!isset($data['roundTime']))
      $this->throwValidationError(23);


    if (!is_bool($data['allowPan']))
      $this->throwValidationError(30);

    if (!is_bool($data['allowZoom']))
      $this->throwValidationError(31);

    if (!is_bool($data['allowMove']))
      $this->throwValidationError(32);

    if (!is_numeric($data['roundTime']))
      $this->throwValidationError(33);

    if ($data['roundTime'] < 0)
      $this->throwValidationError(40);

    if ($data['roundTime'] > 180)
      $this->throwValidationError(41);

    if ($data['roundTime'] % 5 !== 0)
      $this->throwValidationError(42);

    return true;
  }

  private function validateSubmission(?array $data): bool {
    if ($data === null)
      $this->throwValidationError(10);

    if (
      !isset($data['x']) ||
      !isset($data['y'])
    ) {
      $this->throwValidationError(11);
    }

    if (
      !is_numeric($data['x']) ||
      !is_numeric($data['y'])
    ) {
      $this->throwValidationError(12);
    }

    return true;
  }

  private function throwValidationError(int $code) {
    $validationMessages = [
      0 => 'Uniqid is required',
      1 => 'All rounds submitted',
      10 => 'No data provided',
      11 => 'X and Y coordinates are required',
      12 => 'X and Y coordinates must be numeric',

      20 => 'allowPan is required',
      21 => 'allowZoom is required',
      22 => 'allowMove is required',
      23 => 'roundTime is required',

      30 => 'allowPan must be boolean',
      31 => 'allowZoom must be boolean',
      32 => 'allowMove must be boolean',
      33 => 'roundTime must be numeric',

      40 => 'roundTime must be greater than 0',
      41 => 'roundTime must be less than 180',
      42 => 'roundTime must be a multiple of 5',
    ];

    AppController::throwVerboseError(400, $code, $validationMessages);
  }
}