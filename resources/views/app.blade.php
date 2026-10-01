<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="dark">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <link rel="icon" href="/favicon.ico" sizes="any">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx'])
        <x-inertia::head>
            <title>{{ \App\Models\Setting::getValue('company_name', config('app.name', 'Winzelle System')) }}</title>
        </x-inertia::head>
        <script>
            try {
                if (localStorage.getItem('theme') === 'light') {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('theme-light');
                } else {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('theme-light');
                }
            } catch (e) {}
        </script>
    </head>
    <body class="font-sans antialiased bg-slate-950 text-slate-100">
        <x-inertia::app />
    </body>
</html>
