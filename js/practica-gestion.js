/* Gestión Pública: un fieldset[data-respuesta] equivale a una pregunta. */
(() => {
  "use strict";

  function iniciar() {
    const seccion = document.querySelector("section.practica#practica");
    const form = seccion?.querySelector("#quiz-form");
    const cuestionario = form?.closest(".cuestionario");
    if (!form || !cuestionario || form.dataset.practicaIniciada === "si") return;

    const preguntas = [...form.querySelectorAll("fieldset[data-respuesta]")];
    if (!preguntas.length) return;
    form.dataset.practicaIniciada = "si";

    // Elementos creados aquí para que las clases solo tengan que aportar preguntas.
    const barra = document.createElement("div");
    barra.className = "practica-avance";
    barra.innerHTML = '<span class="practica-avance__titulo">Tu avance</span><div class="practica-avance__pista" role="progressbar" aria-label="Preguntas respondidas" aria-valuemin="0"><span class="practica-avance__relleno"></span></div><span class="practica-avance__dato"></span>';
    // Dentro de la tarjeta: al fijarse, respeta su ancho y se libera al terminarla.
    cuestionario.insertBefore(barra, form);

    const acciones = form.querySelector(".quiz-acciones") || form.appendChild(document.createElement("div"));
    acciones.classList.add("quiz-acciones");
    const enviar = acciones.querySelector('button[type="submit"]');
    if (!enviar) {
      const boton = document.createElement("button");
      boton.type = "submit";
      boton.textContent = "Comprobar respuestas";
      acciones.append(boton);
    }
    let reiniciar = acciones.querySelector("#quiz-reiniciar");
    if (!reiniciar) {
      reiniciar = document.createElement("button");
      reiniciar.id = "quiz-reiniciar";
      reiniciar.type = "button";
      reiniciar.textContent = "Intentar de nuevo";
      acciones.append(reiniciar);
    }
    let mensaje = form.querySelector("#quiz-resultado");
    if (!mensaje) {
      mensaje = document.createElement("p");
      mensaje.id = "quiz-resultado";
    }
    mensaje.setAttribute("role", "status");
    mensaje.setAttribute("aria-live", "polite");

    const tarjeta = document.createElement("div");
    tarjeta.className = "practica-resultado";
    tarjeta.innerHTML = '<div class="practica-resultado__cabecera"><div><span class="practica-resultado__rotulo">Tu resultado</span><strong class="practica-resultado__titulo"></strong></div><span class="practica-resultado__nota"></span></div><div class="practica-resultado__pista"><span class="practica-resultado__relleno"></span></div>';
    acciones.after(tarjeta);
    tarjeta.append(mensaje);

    const pista = barra.querySelector(".practica-avance__pista");
    const relleno = barra.querySelector(".practica-avance__relleno");
    const dato = barra.querySelector(".practica-avance__dato");
    const titulo = tarjeta.querySelector(".practica-resultado__titulo");
    const nota = tarjeta.querySelector(".practica-resultado__nota");
    const resultadoRelleno = tarjeta.querySelector(".practica-resultado__relleno");

    // Admite alternativas radio, select y respuesta escrita; para escritura se pueden
    // separar sinónimos con | en data-respuesta. Tildes y puntuación se respetan.
    const normalizar = valor => String(valor ?? "").trim().replace(/\s+/g, " ").toLocaleLowerCase("es");
    function seleccion(pregunta) {
      const radios = [...pregunta.querySelectorAll('input[type="radio"]:checked')];
      const checks = [...pregunta.querySelectorAll('input[type="checkbox"]:checked')];
      if (radios.length) return {valor: radios[0].value, controles: radios};
      if (checks.length) return {valor: checks.map(x => x.value).sort().join(","), controles: checks};
      const campo = pregunta.querySelector("select, textarea, input:not([type=radio]):not([type=checkbox]):not([type=hidden])");
      if (campo && normalizar(campo.value)) return {valor: campo.value, controles: [campo]};
      return null;
    }
    function limpiarMarcas() {
      preguntas.forEach(p => {
        p.classList.remove("correcta", "incorrecta", "sin-respuesta");
        p.querySelectorAll(".respuesta-correcta, .respuesta-incorrecta").forEach(el =>
          el.classList.remove("respuesta-correcta", "respuesta-incorrecta"));
      });
    }
    function inicializarResultado() {
      titulo.textContent = "Todo empieza con un intento.";
      nota.innerHTML = `0<small>/${preguntas.length}</small>`;
      resultadoRelleno.style.width = "0%";
      mensaje.textContent = "Comprueba tu resultado.";
    }
    function actualizarAvance() {
      const respondidas = preguntas.filter(p => seleccion(p)).length;
      const total = preguntas.length;
      relleno.style.width = `${respondidas / total * 100}%`;
      pista.setAttribute("aria-valuemax", String(total));
      pista.setAttribute("aria-valuenow", String(respondidas));
      dato.textContent = `${respondidas}/${total} · ${respondidas === total ? "Listo para comprobar" : `Faltan ${total - respondidas}`}`;
    }
    function marcarRespuesta(pregunta, respuesta, correcta) {
      const control = respuesta.controles[0];
      const etiqueta = control.closest("label");
      if (etiqueta) etiqueta.classList.add(correcta ? "respuesta-correcta" : "respuesta-incorrecta");
      pregunta.classList.add(correcta ? "correcta" : "incorrecta");
      if (!correcta) {
        const opciones = [...pregunta.querySelectorAll('input[type="radio"], input[type="checkbox"]')];
        opciones.filter(x => normalizar(x.value) === normalizar(pregunta.dataset.respuesta))
          .forEach(x => x.closest("label")?.classList.add("respuesta-correcta"));
      }
    }

    form.addEventListener("input", () => { limpiarMarcas(); inicializarResultado(); actualizarAvance(); });
    form.addEventListener("change", () => { limpiarMarcas(); inicializarResultado(); actualizarAvance(); });
    form.addEventListener("submit", e => {
      e.preventDefault();
      limpiarMarcas();
      const faltantes = preguntas.filter(p => !seleccion(p));
      if (faltantes.length) {
        faltantes.forEach(p => p.classList.add("sin-respuesta"));
        titulo.textContent = "Aún quedan preguntas.";
        nota.innerHTML = `0<small>/${preguntas.length}</small>`;
        resultadoRelleno.style.width = "0%";
        mensaje.textContent = `Responde ${faltantes.length} ${faltantes.length === 1 ? "pregunta pendiente" : "preguntas pendientes"} para comprobar tu resultado.`;
        faltantes[0].scrollIntoView({behavior: "smooth", block: "center"});
        return;
      }
      let aciertos = 0;
      preguntas.forEach(p => {
        const respuesta = seleccion(p);
        const correctas = p.dataset.respuesta.split("|").map(normalizar);
        const correcta = correctas.includes(normalizar(respuesta.valor));
        if (correcta) aciertos++;
        marcarRespuesta(p, respuesta, correcta);
      });
      const porcentaje = Math.round(aciertos / preguntas.length * 100);
      titulo.textContent = porcentaje === 100 ? "¡Excelente trabajo!" : porcentaje >= 80 ? "Muy buen resultado." : porcentaje >= 60 ? "Buen avance." : "Sigue practicando.";
      nota.innerHTML = `${aciertos}<small>/${preguntas.length}</small>`;
      resultadoRelleno.style.width = `${porcentaje}%`;
      mensaje.textContent = `${aciertos} respuestas correctas de ${preguntas.length} (${porcentaje} %). ${porcentaje < 100 ? "Revisa las respuestas señaladas y vuelve a intentarlo." : "Dominaste esta práctica."}`;
      tarjeta.scrollIntoView({behavior: "smooth", block: "nearest"});
    });
    reiniciar.addEventListener("click", () => {
      form.reset();
      limpiarMarcas();
      inicializarResultado();
      actualizarAvance();
    });
    inicializarResultado();
    actualizarAvance();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar, {once: true});
  else iniciar();
})();
