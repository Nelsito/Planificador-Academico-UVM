document.addEventListener('DOMContentLoaded', () => {
    const btnCalcular = document.getElementById('btn-calcular');
    const emptyState = document.getElementById('empty-state');
    const canvas = document.getElementById('grafo-canvas');

    btnCalcular.addEventListener('click', async () => {
        try {
            // 1. Ocultar el texto de inicio y mostrar el lienzo
            emptyState.style.display = 'none';
            canvas.style.display = 'block';

            // 2. Leer el archivo JSON de materias (Asegúrate de usar Live Server)
            const response = await fetch('materias.json');
            if (!response.ok) throw new Error("No se pudo leer el materias.json");
            const materias = await response.json();

            // 3. Preparar los datos para Vis.js
            let nodosArray = [];
            let aristasArray = [];

            materias.forEach(materia => {
                // Crear el Nodo (La materia)
                nodosArray.push({
                    id: materia.codigo,
                    label: materia.nombre + '\n(' + materia.codigo + ')',
                    level: materia.semestre, // Ordenamiento topológico base por semestre
                    group: materia.semestre  // Color distinto por semestre
                });

                // Crear las Aristas (Las flechas de prelación)
                if (materia.prelaciones && materia.prelaciones.length > 0) {
                    materia.prelaciones.forEach(prelacion => {
                        aristasArray.push({
                            from: prelacion, // Materia origen
                            to: materia.codigo, // Materia destino
                            arrows: 'to'
                        });
                    });
                }
            });

            // 4. Configurar el motor del Grafo
            const data = {
                nodes: new vis.DataSet(nodosArray),
                edges: new vis.DataSet(aristasArray)
            };

            const options = {
                nodes: {
                    shape: 'box',
                    margin: 10,
                    font: { face: 'Inter', color: '#ffffff', size: 14 },
                    color: {
                        background: '#00503a',
                        border: '#006a4e',
                        highlight: { background: '#83d7b4', border: '#00503a' }
                    }
                },
                edges: {
                    color: '#bec9c2',
                    smooth: { type: 'cubicBezier', forceDirection: 'horizontal', roundness: 0.4 }
                },
                layout: {
                    hierarchical: {
                        direction: 'LR', // Izquierda a Derecha
                        nodeSpacing: 80,
                        levelSeparation: 250,
                        sortMethod: 'directed'
                    }
                },
                physics: false // Desactivamos rebotes para que quede fijo como diagrama
            };

            // 5. Dibujar el Grafo
            new vis.Network(canvas, data, options);

        } catch (error) {
            console.error("Error al cargar el grafo:", error);
            alert("Error: Asegúrate de estar usando una extensión como 'Live Server' para poder leer el archivo materias.json correctamente.");
        }
    });
});