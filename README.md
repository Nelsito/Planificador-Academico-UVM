# 🎓 Sistema de Planificación Académica - UVM

![Estado](https://img.shields.io/badge/Estado-En_Desarrollo-success)
![Universidad](https://img.shields.io/badge/Universidad-Valle_del_Momboy-00503a)

Una herramienta interactiva y visual basada en la teoría de grafos, diseñada para ayudar a los estudiantes de la **Universidad Valle del Momboy (UVM)** a planificar su ruta académica de manera inteligente.

## ✨ Características Principales

* **🗺️ Mapa de Prelaciones Dinámico:** Visualización completa del pensum mediante grafos interactivos.
* **🔄 Multicarrera:** Soporte integrado para los pensums de *Ingeniería en Computación* e *Ingeniería Industrial*.
* **🕹️ Simulador de Progreso:** Sistema interactivo (Doble clic) para marcar materias aprobadas y descubrir qué asignaturas se desbloquean en tiempo real.
* **🔍 Buscador Inteligente:** Filtrado de materias y códigos en tiempo real con resaltado visual en el grafo.
* **📸 Exportación de Rutas:** Capacidad de descargar el mapa académico personalizado en formato PNG.
* **🛤️ Rastreo Bidireccional:** Análisis de dependencias hacia atrás (Prerrequisitos) y hacia adelante (Ruta a futuro).

## 🛠️ Tecnologías Utilizadas

* **HTML5, CSS3 y JavaScript (Vanilla)**
* **Tailwind CSS:** Para el diseño de interfaz UI/UX moderno y responsivo.
* **Vis.js (Network):** Motor principal para la renderización y físicas de los grafos dirigidos.
* **Cypress:** Pruebas automatizadas End-to-End (E2E) para asegurar la estabilidad del sistema.

## 🚀 Cómo ejecutar el proyecto localmente

Debido a que el sistema realiza peticiones `fetch()` para leer las bases de datos `.json`, es necesario ejecutarlo a través de un servidor local.

1. Clona este repositorio en tu máquina:
   ```bash
   git clone [https://github.com/tu-usuario/Planificador-Academico-UVM.git](https://github.com/tu-usuario/Planificador-Academico-UVM.git)