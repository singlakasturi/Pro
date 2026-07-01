package HackMol.Pro.config;

import com.fasterxml.jackson.core.StreamReadConstraints;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonConfig {

    @Bean
    public Jackson2ObjectMapperBuilderCustomizer customStreamReadConstraints() {
        return builder -> builder.postConfigurer(objectMapper -> {
            StreamReadConstraints constraints = StreamReadConstraints.builder()
                    .maxNestingDepth(20)
                    .maxStringLength(1024 * 1024) // 1MB maximum string value length
                    .build();
            objectMapper.getFactory().setStreamReadConstraints(constraints);
        });
    }
}
