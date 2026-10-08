// Acordeón de bloques del plan de estudios.
document.addEventListener('DOMContentLoaded', () => {
    const modulos = document.querySelectorAll('.modulo');

    modulos.forEach((modulo, index) => {
        const cabecera = modulo.querySelector('.modulo-cabecera');
        const lista = modulo.querySelector('.cursos-lista');
        if (!cabecera || !lista) return;

        const listaId = `modulo-contenido-${index + 1}`;
        lista.id = listaId;
        cabecera.setAttribute('role', 'button');
        cabecera.setAttribute('tabindex', '0');
        cabecera.setAttribute('aria-controls', listaId);
        cabecera.setAttribute('aria-expanded', 'false');
        modulo.classList.remove('modulo-abierto');

        const alternarBloque = () => {
            const estabaAbierto = modulo.classList.contains('modulo-abierto');

            modulos.forEach(otro => {
                otro.classList.remove('modulo-abierto');
                const otraCabecera = otro.querySelector('.modulo-cabecera');
                if (otraCabecera) otraCabecera.setAttribute('aria-expanded', 'false');
            });

            if (!estabaAbierto) {
                modulo.classList.add('modulo-abierto');
                cabecera.setAttribute('aria-expanded', 'true');
            }
        };

        cabecera.addEventListener('click', alternarBloque);
        cabecera.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                alternarBloque();
            }
        });
    });
});
