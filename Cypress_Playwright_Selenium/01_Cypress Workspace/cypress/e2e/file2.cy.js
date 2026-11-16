describe('Task 1: UI AUTOMATION TASK', () => {
    it('First Candidate as Performer...', () => {
        cy.fixture('paths').then((paths) => {
            cy.fixture('user_data').then((users)=>{
                each_candidate(users, paths)
                cy.wait(2000)
            });
        });
    });
});

function each_candidate(users, paths){
    let delay_gap = 2000;
    cy.visit(paths.url)
    cy.get(paths.username).type(users.names[0])
    cy.get(paths.password).type(users.password)
    cy.wait(delay_gap)
    cy.get(paths.login).click()//.wait(delay_gap)
    cy.wait(delay_gap)
    cy.xpath(paths.filter).select("Price (low to high)")
    cy.wait(delay_gap)
    cy.xpath("(" + paths.add_to_cart + "//button)[1]").click()
    cy.wait(delay_gap)
    cy.xpath("(" + paths.add_to_cart + "//button)[2]").click()
    cy.wait(delay_gap)
    const collectedItems = {};
    cy.xpath("(" + paths.add_to_cart + ")[1]//a").invoke('text').then((txt) => {
        cy.log(txt);
        collectedItems.first_title = txt.trim();
    });
    cy.xpath("(" + paths.add_to_cart + ")[2]//a").invoke('text').then((text) => {
        cy.log(text);
        collectedItems.second_title = text.trim();
    });
    cy.xpath("(" + paths.add_to_cart + ")[1]//div[@class='inventory_item_desc']").invoke('text').then((text) => {
        cy.log(text);
        collectedItems.first_item_description = text.trim();
    });
    cy.xpath("(" + paths.add_to_cart + ")[2]//div[@class='inventory_item_desc']").invoke('text').then((text) => {
        cy.log(text);
        collectedItems.second_item_description = text.trim();
    }).then(() => {
        cy.writeFile('cypress/fixtures/cart_items.json', [collectedItems]);
    });
    cy.xpath(paths.cart).click()
    cy.wait(delay_gap)
    cy.fixture("cart_items.json").then((items) => {
        if (items[0].first_title.includes("Labs One")){
            cy.log("Yes first title is same✅")
        }
        if (items[0].second_title.startsWith("Sauce Labs")){
            cy.log("Yes Second title is same✅")
        }
        if (items[0].first_item_description.endsWith("bottom won't unravel.")){
            cy.log("Yes First description is same✅")
        }
        expect(items[0].second_item_description).to.contain("3 lighting modes, 1 AAA battery");
        cy.xpath("(" + paths.cart_items + ")[1]/a").should('contain', items[0].first_title)
        cy.xpath("(" + paths.cart_items + ")[1]/div[1]").should('contain', items[0].first_item_description)
        cy.xpath("(" + paths.cart_items + ")[2]/a").should('contain', items[0].second_title)
        cy.xpath("(" + paths.cart_items + ")[2]/div[1]").should('contain', items[0].second_item_description)
        const removed_item = {}
        cy.xpath("(" + paths.cart_items + ")[2]/a").invoke('text').then((txt) => {
            cy.log(txt);
            removed_item.title = txt.trim();
        });
        cy.xpath("(" + paths.cart_items + ")[2]/div[1]").invoke('text').then((txt) => {
            cy.log(txt);
            removed_item.description = txt.trim();
        }).then(() => {
            cy.writeFile('cypress/fixtures/removed_items.json', [removed_item]);
        });
        cy.wait(delay_gap)
        cy.xpath("(" + paths.cart_items + ")[2]//button").click()
        cy.wait(delay_gap)
    });
    cy.get(paths.continue_shoping).click()
    cy.wait(delay_gap)
    cy.xpath(paths.add_to_cart).each(($item) => {
        const title = $item.find("[id*='title_link']").text().trim()
        const description = $item.find(".inventory_item_desc").text().trim()
        cy.fixture("removed_items.json").then((items) => {
            if (title.includes(items[0].title) && description.includes(items[0].description)){
                cy.wrap($item).xpath(".//button").click()
                cy.wait(delay_gap)
            }
        })
    })
    cy.xpath(paths.cart).click()
    cy.wait(delay_gap)
    cy.get(paths.checkout).click()
    cy.wait(delay_gap)
    let firstname = `first_name_${Math.random() * 100}`
    let lastname = `last_name_${Math.random() * 100}`
    let zipcode = `${Math.floor(Math.random() * 100)}`
    cy.get(paths.checkout_firstname).type(firstname)
    cy.get(paths.checkout_lastname).type(lastname)
    cy.get(paths.checkout_postalcode).type(zipcode)
    cy.wait(delay_gap)
    cy.get(paths.checkout_continue).click()
    let sum = 0
    cy.xpath(paths.price).each(($price) => {
        let value = $price.text().substring(1)
        sum += parseFloat(value)
    })
    cy.xpath(paths.total).invoke('text').then((text) => {
        const startIndex = text.indexOf('$') + 1; // 3. Get substring start index after '$'
        const floatString = text.substring(startIndex); // 4. Get substring from index to end
        const total = parseFloat(floatString); 
        expect(sum).to.eq(total);
    })
    cy.get(paths.finish).click()
    cy.wait(delay_gap)
    cy.xpath(paths.success_message_header).should('contain', 'Thank you for your order!')
    cy.xpath(paths.success_message_text).should('contain', 'Your order has been dispatched, and will arrive just as fast as the pony can get there!')
    cy.get(paths.back_to_home).click()
    cy.wait(delay_gap)
    cy.get(paths.menu).click()
    cy.wait(delay_gap)
    cy.get(paths.logout).click()
}