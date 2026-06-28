package HackMol.Pro.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private AdminAuthInterceptor adminAuthInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(adminAuthInterceptor)
                .addPathPatterns(
                        "/api/v1/test",
                        "/api/v1/contests",
                        "/api/v1/question",
                        "/api/v1/submissions/bulk",
                        "/api/v1/plagiarism/run/**",
                        "/api/v1/admin/**"
                );
    }
}
