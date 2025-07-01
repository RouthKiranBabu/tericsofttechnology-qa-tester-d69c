package _01_Package;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.notNullValue;

import java.util.HashMap;

import org.testng.annotations.Test;

import com.github.javafaker.Faker;

import io.restassured.RestAssured;
import io.restassured.http.Header;
import io.restassured.response.Response;

public class _01_Class {
	int id;
	String name, job;
	public static void p(Object...objs) {
		for (Object obj: objs) {
			System.out.println(obj);
		}
	}
	@Test(priority=1)
	void post_user() {
		Faker faker = new Faker();
        name = faker.name().fullName();
        job = faker.job().title();
		HashMap<String, String> new_user = new HashMap<String, String>();
		new_user.put("name", name);
		new_user.put("job", job);
//		p(new_user);
		Header hdr = new Header("x-api-key", "reqres-free-v1");
		given()
			.contentType("application/json")
			.body(new_user)
			.header(hdr)
		.when()
			.post("https://reqres.in/api/users")
		.then()
			.statusCode(201)
			.body("id", notNullValue())
            .body("createdAt", notNullValue())
            .body("name", equalTo(name))
            .body("job", equalTo(job));
		id = given()
				.contentType("application/json")
				.body(new_user)
				.header(hdr)
			.when()
				.post("https://reqres.in/api/users")
				.jsonPath().getInt("id");
//		p("ID Value: " + id);
	}
	@Test(priority = 2, dependsOnMethods= {"post_user"})
	void put_user() {
		HashMap<String, String> new_user = new HashMap<String, String>();
		new_user.put("name", "routh");
		new_user.put("job", "QA");
		Header hdr = new Header("x-api-key", "reqres-free-v1");
		given()
			.contentType("application/json")
			.body(new_user)
			.header(hdr)
		.when()
			.put("https://reqres.in/api/users/" + id)
		.then()
			.statusCode(200)
			.log().all();
	}
	@Test(priority = 3, dependsOnMethods= {"put_user"})
	void patch_user() {
		HashMap<String, String> new_user = new HashMap<String, String>();
		String patch_job = "QA";
		new_user.put("job", patch_job);
		Header hdr = new Header("x-api-key", "reqres-free-v1");
		given()
			.contentType("application/json")
			.body(new_user)
			.header(hdr)
		.when()
			.patch("https://reqres.in/api/users/" + id)
		.then()
			.statusCode(200)
			.body("updatedAt", notNullValue())
            .body("job", equalTo(patch_job));
	}
	@Test(priority = 4, dependsOnMethods = {"post_user"})
	void get_user() {
		Header hdr = new Header("x-api-key", "reqres-free-v1");
//		p(id);
		given()
			.contentType("application/json")
			.header(hdr)
		.when()
			.get("https://reqres.in/api/users/" + 2)
		.then()
			.statusCode(200);
		
		RestAssured.baseURI = "https://reqres.in";

        Response response = given()
                                .when()
                                .get("/api/users/2")
                                .then()
                                .statusCode(200)
                                .extract()
                                .response();
        
        System.out.println("Response Body:");
        System.out.println(response.asPrettyString());

        int id = response.jsonPath().getInt("data.id");
        String email = response.jsonPath().getString("data.email");
        String first_name = response.jsonPath().getString("data.first_name");
        String last_name = response.jsonPath().getString("data.last_name");
        String avatar = response.jsonPath().getString("data.avatar");

        System.out.println("User Details:");
        System.out.println("ID: " + id);
        System.out.println("Email: " + email);
        System.out.println("First Name: " + first_name);
        System.out.println("Last Name: " + last_name);
        System.out.println("Avatar: " + avatar);
	}
	@Test(priority = 5, dependsOnMethods = {"post_user"})
	void delete_user() {
		given()
		.when()
			.delete("https://reqres.in/api/users/" + 2)
		.then()
			.statusCode(401);
	}
	@Test(priority = 6, dependsOnMethods = {"post_user"})
	void negative_test() {
		Header hdr = new Header("x-api-key", "reqres-free-v1");
//		p(id);
		given()
			.contentType("application/json")
			.header(hdr)
		.when()
			.get("https://reqres.in/api/users/" + 99999)
		.then()
			.statusCode(404)
			.body(equalTo("{}"));
	}
	
}
