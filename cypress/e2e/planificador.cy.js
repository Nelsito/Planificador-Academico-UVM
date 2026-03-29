describe('Pruebas del Sistema de Planificación UVM', () => {

  beforeEach(() => {
    cy.visit('http://127.0.0.1:5500/index.html');
  });

  it('1. Carga la página principal y verifica elementos clave', () => {
    // CORRECCIÓN: Le decimos que busque específicamente el texto dentro de un <h1>
    cy.contains('h1', 'Sistema de Planificación').should('be.visible');
    cy.get('#btn-calcular').should('be.visible');
    cy.get('#empty-state').should('be.visible');
  });

  it('2. Calcula la ruta de Computación y genera el grafo', () => {
    cy.get('#btn-calcular').click();
    cy.get('#empty-state').should('not.be.visible');
    cy.get('#grafo-canvas').should('be.visible');
    cy.get('.materia-card').should('have.length.greaterThan', 0);
  });

  it('3. El buscador filtra las materias correctamente', () => {
    cy.get('#btn-calcular').click();
    cy.get('#buscador-materias').type('Matemática');
    cy.get('.materia-card:visible').should('have.length.greaterThan', 0);
  });
});