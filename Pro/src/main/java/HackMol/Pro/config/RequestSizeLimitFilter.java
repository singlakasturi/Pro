package HackMol.Pro.config;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class RequestSizeLimitFilter implements Filter {

    private static final long MAX_REQUEST_SIZE = 2 * 1024 * 1024; // 2 MB

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        if (request instanceof HttpServletRequest) {
            HttpServletRequest httpRequest = (HttpServletRequest) request;
            long contentLength = httpRequest.getContentLengthLong();
            if (contentLength > MAX_REQUEST_SIZE) {
                HttpServletResponse httpResponse = (HttpServletResponse) response;
                httpResponse.setStatus(HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE);
                httpResponse.setContentType("text/plain");
                httpResponse.getWriter().write("Payload Too Large: Maximum allowed size is 2MB.");
                return;
            }
        }
        chain.doFilter(request, response);
    }
}
