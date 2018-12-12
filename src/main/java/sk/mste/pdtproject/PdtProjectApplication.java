package sk.mste.pdtproject;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PdtProjectApplication {

	public static void main(String[] args) {
		SpringApplication.run(PdtProjectApplication.class, args);
		// TODO: add library connection to school
		// TODO: find save schools that are futher away from area with high fire density
		// TODO: add action listeners to checkboxes and input fields to trigger search action
		// TODO: REFACTOR

	}
}
