package tests;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.io.FileReader;
import java.io.IOException;
import java.time.Duration;
import java.util.List;

public class E2ECheckoutTest {

    private WebDriver driver;
    private WebDriverWait wait;
    private JsonObject paths;
    private JsonObject userData;

    @BeforeMethod
    public void setUp() throws IOException {
        // Load JSON fixtures
        paths = JsonParser.parseReader(new FileReader("src/test/resources/paths.json")).getAsJsonObject();
        userData = JsonParser.parseReader(new FileReader("src/test/resources/user_data.json")).getAsJsonObject();

        // Initialize ChromeDriver (Selenium Manager handles driver binaries automatically in Selenium 4+)
        driver = new ChromeDriver();
        driver.manage().window().maximize();
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    @Test
    public void firstCandidatePerformerTest() throws InterruptedException {
        String username = userData.getAsJsonArray("names").get(0).getAsString();
        String password = userData.get("password").getAsString();

        // 1. Login
        driver.get(paths.get("url").getAsString());
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector(paths.get("username").getAsString()))).sendKeys(username);
        driver.findElement(By.cssSelector(paths.get("password").getAsString())).sendKeys(password);
        driver.findElement(By.cssSelector(paths.get("login").getAsString())).click();
        Thread.sleep(2000);

        // 2. Sort & Add first two items to cart
        WebElement dropdownElement = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath(paths.get("filter").getAsString())));
        Select dropdown = new Select(dropdownElement);
        dropdown.selectByVisibleText("Price (low to high)");

        List<WebElement> addToCartButtons = driver.findElements(By.xpath(paths.get("add_to_cart").getAsString() + "//button"));
        addToCartButtons.get(0).click();
        addToCartButtons.get(1).click();
        Thread.sleep(2000);

        // 3. Collect item details
        List<WebElement> inventoryItems = driver.findElements(By.xpath(paths.get("add_to_cart").getAsString()));
        String firstTitle = inventoryItems.get(0).findElement(By.xpath(".//a")).getText().trim();
        String secondTitle = inventoryItems.get(1).findElement(By.xpath(".//a")).getText().trim();
        String firstDesc = inventoryItems.get(0).findElement(By.xpath(".//div[@class='inventory_item_desc']")).getText().trim();
        String secondDesc = inventoryItems.get(1).findElement(By.xpath(".//div[@class='inventory_item_desc']")).getText().trim();
        Thread.sleep(2000);
        
        // 4. Open Cart & Verify items
        driver.findElement(By.xpath(paths.get("cart").getAsString())).click();
        Assert.assertTrue(secondDesc.contains("3 lighting modes, 1 AAA battery"));

        List<WebElement> cartItems = wait.until(ExpectedConditions.visibilityOfAllElementsLocatedBy(By.xpath(paths.get("cart_items").getAsString())));
        Assert.assertTrue(cartItems.get(0).findElement(By.xpath("./a")).getText().contains(firstTitle));
        Assert.assertTrue(cartItems.get(0).findElement(By.xpath("./div[1]")).getText().contains(firstDesc));
        Thread.sleep(2000);

        // 5. Remove the second item from cart
        String removedTitle = cartItems.get(1).findElement(By.xpath("./a")).getText().trim();
        String removedDesc = cartItems.get(1).findElement(By.xpath("./div[1]")).getText().trim();
        cartItems.get(1).findElement(By.xpath(".//button")).click();
        Thread.sleep(2000);

        // 6. Continue shopping & re-add the removed item
        driver.findElement(By.cssSelector(paths.get("continue_shoping").getAsString())).click();
        
        List<WebElement> storeItems = wait.until(ExpectedConditions.visibilityOfAllElementsLocatedBy(By.xpath(paths.get("add_to_cart").getAsString())));
        for (WebElement item : storeItems) {
            String title = item.findElement(By.cssSelector("[id*='title_link']")).getText().trim();
            String desc = item.findElement(By.cssSelector(".inventory_item_desc")).getText().trim();
            if (title.equals(removedTitle) && desc.equals(removedDesc)) {
                item.findElement(By.xpath(".//button")).click();
                break;
            }
        }
        Thread.sleep(2000);

        // 7. Checkout Flow
        driver.findElement(By.xpath(paths.get("cart").getAsString())).click();
        driver.findElement(By.cssSelector(paths.get("checkout").getAsString())).click();

        driver.findElement(By.cssSelector(paths.get("checkout_firstname").getAsString())).sendKeys("John");
        driver.findElement(By.cssSelector(paths.get("checkout_lastname").getAsString())).sendKeys("Doe");
        driver.findElement(By.cssSelector(paths.get("checkout_postalcode").getAsString())).sendKeys("12345");
        driver.findElement(By.cssSelector(paths.get("checkout_continue").getAsString())).click();
        Thread.sleep(2000);

        // 8. Calculate & Verify Subtotal
        List<WebElement> prices = driver.findElements(By.xpath(paths.get("price").getAsString()));
        double sum = 0.0;
        for (WebElement priceElement : prices) {
            String priceText = priceElement.getText().substring(1); // Remove '$'
            sum += Double.parseDouble(priceText);
        }

        String totalText = driver.findElement(By.xpath(paths.get("total").getAsString())).getText();
        double total = Double.parseDouble(totalText.substring(totalText.indexOf('$') + 1));
        Assert.assertEquals(sum, total, 0.01);
        Thread.sleep(2000);

        // 9. Finish Order & Logout
        driver.findElement(By.cssSelector(paths.get("finish").getAsString())).click();
        
        WebElement successHeader = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath(paths.get("success_message_header").getAsString())));
        Assert.assertTrue(successHeader.getText().contains("Thank you for your order!"));

        driver.findElement(By.cssSelector(paths.get("back_to_home").getAsString())).click();
        driver.findElement(By.cssSelector(paths.get("menu").getAsString())).click();
        
        WebElement logoutLink = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector(paths.get("logout").getAsString())));
        logoutLink.click();
        Thread.sleep(2000);
    }

    @AfterMethod
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }
}