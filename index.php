<?php

require 'Routing.php';

$path = trim($_SERVER['REQUEST_URI'], '/');
$path = parse_url($path, PHP_URL_PATH);


Router::addRoute(new Route('', 'DefaultController', 'index', RouteTypes::GET));
Router::addRoute(new Route('login', 'AuthController', 'login', RouteTypes::GET));
Router::addRoute(new Route('register', 'AuthController', 'register', RouteTypes::GET));
Router::addRoute(new Route('explore', 'DefaultController', 'explore', RouteTypes::GET));
Router::addRoute(new Route('game', 'GameController', 'gameStart', RouteTypes::GET));
Router::addRoute(new Route('game/:uniqid', 'GameController', 'game', RouteTypes::GET));
Router::addRoute(new Route('leaderboard', 'GameController', 'leaderboard', RouteTypes::GET));

Router::addRoute(new Route('api/v1/views/random', 'ViewController', 'getRandomView', RouteTypes::GET));
Router::addRoute(new Route('api/v1/views/view', 'ViewController', 'getView', RouteTypes::GET));
Router::addRoute(new Route('api/v1/views/closest', 'ViewController', 'getClosestView', RouteTypes::GET));

Router::addRoute(new Route('api/v1/auth/register', 'AuthController', 'apiRegister', RouteTypes::POST));
Router::addRoute(new Route('api/v1/auth/login', 'AuthController', 'apiLogin', RouteTypes::POST));
Router::addRoute(new Route('api/v1/auth/logout', 'AuthController', 'apiLogout', RouteTypes::POST));

Router::addRoute(new Route('api/v1/avatar', 'AvatarController', 'uploadAvatar', RouteTypes::POST));
Router::addRoute(new Route('api/v1/avatar/:id', 'AvatarController', 'getAvatar', RouteTypes::GET));
Router::addRoute(new Route('api/v1/avatar', 'AvatarController', 'deleteAvatar', RouteTypes::DELETE));

Router::addRoute(new Route('api/v1/user', 'UserController', 'getUser', RouteTypes::GET));

Router::addRoute(new Route('api/v1/game/start', 'GameController', 'startGame', RouteTypes::POST));
Router::addRoute(new Route('api/v1/game/top', 'GameController', 'getTopGames', RouteTypes::GET));
Router::addRoute(new Route('api/v1/game/:uniqid', 'GameController', 'getGame', RouteTypes::GET));

Router::addRoute(new Route('api/v1/game/:uniqid/round', 'GameController', 'getRound', RouteTypes::GET));
Router::addRoute(new Route('api/v1/game/:uniqid/rounds', 'GameController', 'getAllRounds', RouteTypes::GET));

Router::addRoute(new Route('api/v1/game/:uniqid/round', 'GameController', 'submitRound', RouteTypes::POST));
Router::addRoute(new Route('api/v1/game/:uniqid/delete', 'GameController', 'deleteGame', RouteTypes::DELETE));

Router::run($path);