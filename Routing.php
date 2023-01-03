<?php

require_once 'src/php/controllers/DefaultController.php';
require_once 'src/php/controllers/ViewController.php';
require_once 'src/php/controllers/AuthController.php';
require_once 'src/php/controllers/AvatarController.php';
require_once 'src/php/controllers/UserController.php';
require_once 'Route.php';

class Router {
    public static array $routes = [];

    public static function addRoute(Route $route) {
        $explodedPath = explode('/', $route->path);
        $routesRef = & self::$routes;

        array_push($explodedPath, '/');

        while (count($explodedPath) > 0) {
            $dir = array_shift($explodedPath);

            if (Route::isParam($dir))
                $dir = ':param';


            if (!array_key_exists($dir, $routesRef)) {
                $routesRef[$dir] = [];
                $routesRef = & $routesRef[$dir];
            } else {
                $routesRef = & $routesRef[$dir];
            }
        }

        $type = $route->type->value;
        $routesRef[$type] = $route;
    }

    public static function getRoute($path): Route {
        $explodedPath = explode('/', $path);
        if (count($explodedPath) > 10)
            AppController::throwNotFound();

        $routesRef = & self::$routes;

        $requestType = Route::getTypeByString($_SERVER['REQUEST_METHOD']);
        if ($requestType === null)
            AppController::throwNotAllowed();

        array_push($explodedPath, '/');

        while (count($explodedPath) > 0) {
            $dir = array_shift($explodedPath);

            if (!array_key_exists($dir, $routesRef)) {
                if (!array_key_exists(':param', $routesRef)) {
                    if (strpos($path, 'api/') !== 0)
                        die(AppController::get404View());

                    AppController::throwNotFound();
                } else {
                    $dir = ':param';
                }
            }

            $routesRef = & $routesRef[$dir];
        }

        if (!array_key_exists($requestType, $routesRef))
            AppController::throwNotAllowed();

        $route = $routesRef[$requestType];

        if (!($route instanceof Route))
            AppController::throwNotFound();


        return $routesRef[$requestType];
    }

    public static function run($path) {
        $route = self::getRoute($path);

        $controller = $route->controller;
        $action = $route->action;

        $object = new $controller;

        if ($route->hasParams) {
            $object->$action($route->extractParams($path));
        } else {
            $object->$action();
        }
    }
}