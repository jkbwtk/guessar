<?php

enum RouteTypes:int {
    case GET = 0;
    case POST = 1;
    case PUT = 2;
    case DELETE = 3;
}

class Route {
    public string $path;
    public string $controller;
    public string $action;
    public RouteTypes $type;

    public bool $hasParams;
    public array $explodedPath;

    public static array $routeTypesKeys = [
        'GET' => 0,
        'POST' => 1,
        'PUT' => 2,
        'DELETE' => 3
    ];

    public function __construct($path, $controller, $action, $type) {
        $this->path = trim($path, '/');
        $this->controller = $controller;
        $this->action = $action;
        $this->type = $type;
        $this->hasParams = $this->checkIfHasParams();
        $this->explodedPath = explode('/', $this->path);
    }

    private function checkIfHasParams(): bool {
        $explodedPath = explode('/', $this->path);

        foreach ($explodedPath as $dir) {
            if (self::isParam($dir)) {
                return true;
            }
        }

        return false;
    }

    public function extractParams(string $path): array {
        $params = [];

        $explodedPath = explode('/', $path);

        for ($i = 0; $i < count($explodedPath); $i += 1) {
            $key = $this->explodedPath[$i];

            if (self::isParam($key)) 
                $params[substr($key, 1)] = $explodedPath[$i];
        }


        return $params;
    }

    public static function isParam(string $dir): bool {
        return strpos($dir, ':') === 0;
    }

    public static function mapRouteTypesKeys(): array {
        $cases = RouteTypes::cases();
        $keys = [];

        foreach ($cases as $case) {
            $keys[$case->name] = $case->value;
        }

        return $keys;
    }

    public static function getTypeByString(string $type): ?int {
        $type = strtoupper($type);

        if (array_key_exists($type, self::$routeTypesKeys)) {
            return self::$routeTypesKeys[$type];
        }

        return null;
    }
}