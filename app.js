document.addEventListener('DOMContentLoaded', () => {
    const btnCalcular = document.getElementById('btn-calcular');
    const emptyState = document.getElementById('empty-state');
    const canvas = document.getElementById('grafo-canvas');
    const contenedorLista = document.getElementById('lista-materias');
    const tituloCarrera = document.getElementById('titulo-carrera');
    const botonesCarrera = document.querySelectorAll('.btn-carrera');

    let redGrafo = null;
    let nodosDataSet = null;
    let aristasDataSet = null;
    let datosOriginales = { nodos: [], aristas: [] };

    // Valores por defecto al iniciar la página
    let archivoActual = 'materias.json';
    let nombreCarreraActual = 'Ingeniería en Computación';

    // --- LÓGICA DE LOS BOTONES DE CARRERA ---
    botonesCarrera.forEach(boton => {
        boton.addEventListener('click', function () {
            // 1. Apagar todos los botones (estilo inactivo)
            botonesCarrera.forEach(b => {
                b.classList.remove('bg-primary', 'text-white', 'shadow-md');
                b.classList.add('bg-surface-container-low', 'text-on-surface-variant', 'border', 'border-outline-variant/50');
            });

            // 2. Prender el botón que acabo de tocar (estilo activo)
            this.classList.remove('bg-surface-container-low', 'text-on-surface-variant', 'border', 'border-outline-variant/50');
            this.classList.add('bg-primary', 'text-white', 'shadow-md');

            // 3. Actualizar qué carrera vamos a cargar
            archivoActual = this.getAttribute('data-file');
            nombreCarreraActual = this.getAttribute('data-name');

            // 4. ¡Hacer el cálculo automáticamente! (Simula hacer clic en el botón verde superior)
            btnCalcular.click();
        });
    });

    // --- LÓGICA PRINCIPAL DEL GRAFO ---
    btnCalcular.addEventListener('click', async () => {
        try {
            emptyState.style.display = 'none';
            canvas.style.display = 'block';

            tituloCarrera.textContent = nombreCarreraActual;

            const response = await fetch(archivoActual);
            if (!response.ok) throw new Error(`No se pudo leer el archivo ${archivoActual}.`);
            const materias = await response.json();

            contenedorLista.innerHTML = '';
            let nodosArray = [];
            let aristasArray = [];

            materias.forEach(materia => {
                const reqTexto = materia.prelaciones.length > 0 ? `Requiere: ${materia.prelaciones.join(', ')}` : 'Sin prerrequisitos';
                const cardHTML = `
                <div class="materia-card bg-surface-container-lowest p-4 rounded-xl hover:shadow-lg transition-all cursor-pointer border-l-4 border-outline-variant hover:border-primary mb-2" data-id="${materia.codigo}">
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

            redGrafo.on("click", function (params) {
                if (params.nodes.length > 0) {
                    let idMateria = params.nodes[0];
                    resaltarRuta(idMateria);
                    seleccionarTarjeta(idMateria);
                } else {
                    resetearGrafo();
                }
            });

        } catch (error) {
            console.error("Error:", error);
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
        buscarHaciaAtras(idSeleccionado);

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
        nodosDataSet.update(datosOriginales.nodos);
        aristasDataSet.update(datosOriginales.aristas);
        document.querySelectorAll('.materia-card').forEach(c => c.classList.remove('border-primary', 'shadow-md'));
        redGrafo.fit({ animation: { duration: 500 } });
    }
});