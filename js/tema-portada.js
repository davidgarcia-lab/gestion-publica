(() => {
    const clave = 'gestion-publica-tema';
    const sistema = window.matchMedia('(prefers-color-scheme: dark)');
    let preferencia;

    try {
        preferencia = localStorage.getItem(clave);
    } catch {
        // El navegador puede limitar el almacenamiento al abrir archivos locales.
    }

    function aplicarTema() {
        const noche = preferencia === 'noche' || (preferencia !== 'dia' && sistema.matches);
        document.documentElement.dataset.tema = noche ? 'noche' : 'dia';
        document.getElementById('interruptor-tema')?.setAttribute('aria-checked', String(noche));
    }

    aplicarTema();
    sistema.addEventListener('change', aplicarTema);

    document.addEventListener('DOMContentLoaded', () => {
        const interruptor = document.getElementById('interruptor-tema');
        aplicarTema();
        document.getElementById('control-tema').hidden = false;

        interruptor.addEventListener('click', () => {
            preferencia = document.documentElement.dataset.tema === 'noche' ? 'dia' : 'noche';
            try {
                localStorage.setItem(clave, preferencia);
            } catch {
                // El tema elegido sigue activo durante la visita.
            }
            aplicarTema();
        });
    });
})();
