<?php

class AppController {
    protected function render(string $template = null, array $variables = []) {
        $templatePath = 'public/views/' . $template . '.php';
        $output = self::get404View();

        if (file_exists($templatePath)) {
            extract($variables);

            ob_start();
            include $templatePath;
            $output = ob_get_clean();
        }
        print $output;
    }

    public static function get404View() {
        ob_start();
        include_once 'public/views/404.php';
        $output = ob_get_clean();

        return $output;
    }
}
