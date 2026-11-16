describe('Task 1: UI AUTOMATION TASK', () => {
    it('Logs in for Multiple Users', () => {
        cy.fixture('paths').then((paths) => {
            cy.fixture('user_data').then((users)=>{
                users.names.forEach(name => {
                    cy.visit(paths.url)
                    each_candidate(name, paths)
                });
            })
        });
    });
});

function each_candidate(name, paths){
    cy.get(paths.username).clear().type(name)
    cy.wait(1000)
    cy.fixture('user_data').then((user)=>{
        cy.get(paths.password).clear().type(user.password)
    })
    cy.wait(1000)
    cy.get(paths.login).click()
    cy.wait(1000)
}