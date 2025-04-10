package HackMol.Pro;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@SpringBootApplication
@Configuration
public class SimilarityApplication {

	public static void main(String[] args) {
		SpringApplication.run(SimilarityApplication.class, args);
	}

	@Bean
}
