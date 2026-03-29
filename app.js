document.addEventListener('DOMContentLoaded', () => {
    const btnCalcular = document.getElementById('btn-calcular');
    const emptyState = document.getElementById('empty-state');
    const canvas = document.getElementById('grafo-canvas');
    const contenedorLista = document.getElementById('lista-materias');
    const tituloCarrera = document.getElementById('titulo-carrera');
    const botonesCarrera = document.querySelectorAll('.btn-carrera');

    const buscador = document.getElementById('buscador-materias');
    const btnExportar = document.getElementById('btn-exportar');

    // UI Fase 2
    const leyendaSimulador = document.getElementById('leyenda-simulador');
    const interruptorRuta = document.getElementById('interruptor-ruta');
    const btnAtras = document.getElementById('btn-atras');
    const btnAdelante = document.getElementById('btn-adelante');

    // Pestañas Laterales
    const tabGrafo = document.getElementById('tab-grafo');
    const tabSimulador = document.getElementById('tab-simulador');

    let redGrafo = null;
    let nodosDataSet = null;
    let aristasDataSet = null;
    let datosOriginales = { nodos: [], aristas: [] };

    // Variables de Estado
    let archivoActual = 'materias.json';
    let nombreCarreraActual = 'Ingeniería en Computación';
    let materiasDB = [];
    let materiasAprobadas = new Set();
    let direccionRuta = 'atras';
    let modoSimuladorActivo = false; // Estado inicial

    // --- BOTONES DEL INTERRUPTOR DE DIRECCIÓN ---
    btnAtras.addEventListener('click', () => {
        direccionRuta = 'atras';
        btnAtras.classList.add('bg-primary', 'text-white', 'shadow-md');
        btnAtras.classList.remove('text-slate-500', 'hover:text-primary', 'hover:bg-surface-container-low');
        btnAdelante.classList.remove('bg-primary', 'text-white', 'shadow-md');
        btnAdelante.classList.add('text-slate-500', 'hover:text-primary', 'hover:bg-surface-container-low');
        resetearGrafo();
    });

    btnAdelante.addEventListener('click', () => {
        direccionRuta = 'adelante';
        btnAdelante.classList.add('bg-primary', 'text-white', 'shadow-md');
        btnAdelante.classList.remove('text-slate-500', 'hover:text-primary', 'hover:bg-surface-container-low');
        btnAtras.classList.remove('bg-primary', 'text-white', 'shadow-md');
        btnAtras.classList.add('text-slate-500', 'hover:text-primary', 'hover:bg-surface-container-low');
        resetearGrafo();
    });

    // --- SELECCIÓN DE CARRERA ---
    botonesCarrera.forEach(boton => {
        boton.addEventListener('click', function () {
            botonesCarrera.forEach(b => {
                b.classList.remove('bg-primary', 'text-white', 'shadow-md');
                b.classList.add('bg-surface-container-low', 'text-on-surface-variant', 'border', 'border-outline-variant/50');
            });
            this.classList.remove('bg-surface-container-low', 'text-on-surface-variant', 'border', 'border-outline-variant/50');
            this.classList.add('bg-primary', 'text-white', 'shadow-md');

            archivoActual = this.getAttribute('data-file');
            nombreCarreraActual = this.getAttribute('data-name');
            materiasAprobadas.clear();
            btnCalcular.click();
        });
    });

    // --- CARGA DEL GRAFO ---
    btnCalcular.addEventListener('click', async () => {
        try {
            emptyState.style.display = 'none';
            canvas.style.display = 'block';

            btnExportar.classList.remove('hidden');
            interruptorRuta.classList.remove('hidden');
            buscador.value = '';

            // Mostrar u ocultar la leyenda según el modo activo
            if (modoSimuladorActivo) {
                leyendaSimulador.classList.remove('hidden');
            } else {
                leyendaSimulador.classList.add('hidden');
            }

            tituloCarrera.textContent = nombreCarreraActual;

            const response = await fetch(archivoActual);
            if (!response.ok) throw new Error(`No se pudo leer el archivo ${archivoActual}.`);
            materiasDB = await response.json();

            contenedorLista.innerHTML = '';
            let nodosArray = [];
            let aristasArray = [];

            materiasDB.forEach(materia => {
                const reqTexto = materia.prelaciones.length > 0 ? `Requiere: ${materia.prelaciones.join(', ')}` : 'Sin prerrequisitos';
                const cardHTML = `
                <div class="materia-card bg-surface-container-lowest p-4 rounded-xl hover:shadow-lg transition-all cursor-pointer border-l-4 border-outline-variant hover:border-primary mb-2" data-id="${materia.codigo}" data-nombre="${materia.nombre.toLowerCase()}">
                    <div class="flex justify-between items-start mb-2">
                        <span class="bg-secondary-container px-2 py-1 rounded text-[10px] font-bold text-primary">${materia.codigo}</span>
                        <span class="text-[10px] font-bold text-slate-400">Sem. ${materia.semestre}</span>
                    </div>
                    <h3 class="font-headline font-bold text-on-surface text-sm mb-1">${materia.nombre}</h3>
                    <p class="text-[10px] font-semibold text-on-surface-variant uppercase italic">${reqTexto}</p>
                </div>`;
                contenedorLista.insertAdjacentHTML('beforeend', cardHTML);

                nodosArray.push({
                    id: materia.codigo,
                    label: materia.nombre + '\n(' + materia.codigo + ')',
                    level: materia.semestre,
                    shape: 'box',
                    color: { background: '#ffffff', border: '#00503a' },
                    font: { color: '#191c1d', size: 14, face: 'Inter', bold: true }
                });

                if (materia.prelaciones && materia.prelaciones.length > 0) {
                    materia.prelaciones.forEach(prelacion => {
                        aristasArray.push({
                            from: prelacion,
                            to: materia.codigo,
                            arrows: { to: { enabled: true, scaleFactor: 0.8 } },
                            color: { color: '#bec9c2' }
                        });
                    });
                }
            });

            datosOriginales.nodos = JSON.parse(JSON.stringify(nodosArray));
            datosOriginales.aristas = JSON.parse(JSON.stringify(aristasArray));

            nodosDataSet = new vis.DataSet(nodosArray);
            aristasDataSet = new vis.DataSet(aristasArray);
            const data = { nodes: nodosDataSet, edges: aristasDataSet };

            const options = {
                nodes: { margin: 15, borderWidth: 2, shadow: { enabled: true, color: 'rgba(0,0,0,0.05)', size: 8 } },
                edges: { width: 2, smooth: { type: 'cubicBezier', forceDirection: 'horizontal', roundness: 0.5 } },
                layout: { hierarchical: { direction: 'LR', nodeSpacing: 80, levelSeparation: 300, sortMethod: 'directed' } },
                physics: false,
                interaction: { hover: true, tooltipDelay: 200 }
            };

            if (redGrafo !== null) { redGrafo.destroy(); }
            redGrafo = new vis.Network(canvas, data, options);

            redGrafo.once("afterDrawing", function () {
                redGrafo.fit({ animation: { duration: 1000, easingFunction: 'easeInOutQuad' } });
            });

            // CLIC SIMPLE: Ver Ruta
            redGrafo.on("click", function (params) {
                if (params.nodes.length > 0) {
                    let idMateria = params.nodes[0];
                    resaltarRuta(idMateria);
                    seleccionarTarjeta(idMateria);
                } else {
                    resetearGrafo();
                }
            });

            // DOBLE CLIC: Activar Simulador (Aprobar materia)
            redGrafo.on("doubleClick", function (params) {
                if (!modoSimuladorActivo) return; // Solo funciona en modo simulador
                if (params.nodes.length > 0) {
                    let idMateria = params.nodes[0];
                    if (materiasAprobadas.has(idMateria)) {
                        materiasAprobadas.delete(idMateria);
                    } else {
                        materiasAprobadas.add(idMateria);
                    }
                    ejecutarSimulador();
                }
            });

            // Ejecutar simulador al iniciar si la pestaña está activa
            if (modoSimuladorActivo) {
                ejecutarSimulador();
            }

        } catch (error) {
            console.error("Error:", error);
        }
    });

    // --- EVENTOS DE LA LISTA ---
    contenedorLista.addEventListener('dblclick', (e) => {
        if (!modoSimuladorActivo) return; // Solo funciona en modo simulador
        const card = e.target.closest('.materia-card');
        if (card && redGrafo) {
            let idMateria = card.getAttribute('data-id');
            if (materiasAprobadas.has(idMateria)) { materiasAprobadas.delete(idMateria); }
            else { materiasAprobadas.add(idMateria); }
            ejecutarSimulador();
        }
    });

    contenedorLista.addEventListener('click', (e) => {
        const card = e.target.closest('.materia-card');
        if (card && redGrafo) {
            let idMateria = card.getAttribute('data-id');
            seleccionarTarjeta(idMateria);
            redGrafo.focus(idMateria, { scale: 1.1, animation: { duration: 500 } });
            resaltarRuta(idMateria);
        }
    });

    buscador.addEventListener('input', function (e) {
        if (!nodosDataSet) return;
        const texto = e.target.value.toLowerCase();

        document.querySelectorAll('.materia-card').forEach(card => {
            const nombre = card.getAttribute('data-nombre');
            const codigo = card.getAttribute('data-id').toLowerCase();
            card.style.display = (nombre.includes(texto) || codigo.includes(texto)) ? 'block' : 'none';
        });

        if (texto === '') { resetearGrafo(); return; }

        let nodosActualizados = nodosDataSet.get().map(n => {
            const match = n.label.toLowerCase().includes(texto);
            return {
                id: n.id,
                color: match ? { background: '#83d7b4', border: '#00503a' } : { background: '#f3f4f5', border: '#e1e3e4' },
                font: match ? { color: '#002116' } : { color: '#bec9c2' }
            };
        });
        nodosDataSet.update(nodosActualizados);
    });

    btnExportar.addEventListener('click', () => {
        const elementoCanvas = canvas.querySelector('canvas');
        if (elementoCanvas) {
            const dataUrl = elementoCanvas.toDataURL("image/png");
            const link = document.createElement('a');
            link.download = `Mapa_Academico_${nombreCarreraActual.replace(/ /g, '_')}.png`;
            link.href = dataUrl;
            link.click();
        }
    });

    // --- LÓGICA DE LAS PESTAÑAS (GRAFO VS SIMULADOR) ---
    tabGrafo.addEventListener('click', () => {
        if (!modoSimuladorActivo) return;
        modoSimuladorActivo = false;

        // Estilos: Encender Grafo, Apagar Simulador
        tabGrafo.classList.add('bg-[#e6ece9]', 'text-primary');
        tabGrafo.classList.remove('text-slate-400', 'hover:bg-surface-container');

        tabSimulador.classList.remove('bg-[#e6ece9]', 'text-primary');
        tabSimulador.classList.add('text-slate-400', 'hover:bg-surface-container');

        // Ocultar leyenda y volver al mapa normal
        leyendaSimulador.classList.add('hidden');
        resetearGrafo();
    });

    tabSimulador.addEventListener('click', () => {
        if (modoSimuladorActivo) return;
        modoSimuladorActivo = true;

        // Estilos: Encender Simulador, Apagar Grafo
        tabSimulador.classList.add('bg-[#e6ece9]', 'text-primary');
        tabSimulador.classList.remove('text-slate-400', 'hover:bg-surface-container');

        tabGrafo.classList.remove('bg-[#e6ece9]', 'text-primary');
        tabGrafo.classList.add('text-slate-400', 'hover:bg-surface-container');

        // Mostrar leyenda y arrancar el motor del simulador
        if (nodosDataSet) {
            leyendaSimulador.classList.remove('hidden');
            ejecutarSimulador();
        }
    });

    // --- LÓGICA DEL SIMULADOR ---
    function ejecutarSimulador() {
        if (!modoSimuladorActivo) return; // Doble seguridad

        let nodosActualizados = nodosDataSet.get().map(n => {
            let colorNuevo = { background: '#ffffff', border: '#00503a' }; // Bloqueada
            let fontNuevo = { color: '#191c1d' };

            if (materiasAprobadas.has(n.id)) {
                colorNuevo = { background: '#00503a', border: '#002116' };
                fontNuevo = { color: '#ffffff' };
            } else {
                let matInfo = materiasDB.find(m => m.codigo === n.id);
                if (matInfo) {
                    let cumpleRequisitos = true;
                    if (matInfo.prelaciones.length > 0) {
                        cumpleRequisitos = matInfo.prelaciones.every(req => materiasAprobadas.has(req));
                    }
                    if (cumpleRequisitos && materiasAprobadas.size > 0) {
                        colorNuevo = { background: '#83d7b4', border: '#00503a' };
                        fontNuevo = { color: '#002116' };
                    }
                }
            }
            return { id: n.id, color: colorNuevo, font: fontNuevo };
        });

        nodosDataSet.update(nodosActualizados);
        datosOriginales.nodos = JSON.parse(JSON.stringify(nodosActualizados)); // Actualiza estado base
    }

    // --- LÓGICA DE RASTREO (BIDIRECCIONAL) ---
    function resaltarRuta(idSeleccionado) {
        let nodosActualizados = nodosDataSet.get().map(n => ({
            id: n.id, color: { background: '#f3f4f5', border: '#e1e3e4' }, font: { color: '#bec9c2' }
        }));
        let aristasActualizadas = aristasDataSet.get().map(e => ({
            id: e.id, color: { color: '#e1e3e4' }, width: 1
        }));

        let dependencias = new Set();

        function buscarHaciaAtras(nodoId) {
            dependencias.add(nodoId);
            aristasDataSet.get().filter(e => e.to === nodoId).forEach(e => buscarHaciaAtras(e.from));
        }

        function buscarHaciaAdelante(nodoId) {
            dependencias.add(nodoId);
            aristasDataSet.get().filter(e => e.from === nodoId).forEach(e => buscarHaciaAdelante(e.to));
        }

        if (direccionRuta === 'atras') {
            buscarHaciaAtras(idSeleccionado);
        } else {
            buscarHaciaAdelante(idSeleccionado);
        }

        dependencias.forEach(id => {
            let index = nodosActualizados.findIndex(n => n.id === id);
            if (index !== -1) {
                if (id === idSeleccionado) {
                    nodosActualizados[index].color = { background: '#00503a', border: '#002116' };
                    nodosActualizados[index].font = { color: '#ffffff' };
                } else {
                    nodosActualizados[index].color = { background: '#83d7b4', border: '#00503a' };
                    nodosActualizados[index].font = { color: '#002116' };
                }
            }
        });

        aristasActualizadas.forEach(e => {
            if (dependencias.has(e.from) && dependencias.has(e.to)) {
                e.color = { color: '#00503a' }; e.width = 3;
            }
        });

        nodosDataSet.update(nodosActualizados);
        aristasDataSet.update(aristasActualizadas);
    }

    function seleccionarTarjeta(idMateria) {
        document.querySelectorAll('.materia-card').forEach(c => c.classList.remove('border-primary', 'shadow-md'));
        let cardSeleccionada = document.querySelector(`.materia-card[data-id="${idMateria}"]`);
        if (cardSeleccionada) {
            cardSeleccionada.classList.add('border-primary', 'shadow-md');
            cardSeleccionada.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    function resetearGrafo() {
        if (!nodosDataSet) return;
        nodosDataSet.update(datosOriginales.nodos);
        aristasDataSet.update(datosOriginales.aristas);
        document.querySelectorAll('.materia-card').forEach(c => c.classList.remove('border-primary', 'shadow-md'));
        redGrafo.fit({ animation: { duration: 500 } });

        // Forzar recalcular colores si estamos en simulador
        if (modoSimuladorActivo) ejecutarSimulador();
    }
});