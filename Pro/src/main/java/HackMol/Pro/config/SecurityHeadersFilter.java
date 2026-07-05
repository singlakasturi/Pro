package HackMol.Pro.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class SecurityHeadersFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        if (response instanceof HttpServletResponse) {
            HttpServletResponse httpResponse = (HttpServletResponse) response;
            
            // Content-Security-Policy: restrict scripts to trusted sources only
            httpResponse.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; object-src 'none';");
            
            // Referrer-Policy: strict-origin-when-cross-origin
            httpResponse.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
            
            // X-Content-Type-Options: nosniff
            httpResponse.setHeader("X-Content-Type-Options", "nosniff");
            
            // Permissions-Policy: disable camera, microphone, and geolocation
            httpResponse.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
        }
        chain.doFilter(request, response);
    }
}
