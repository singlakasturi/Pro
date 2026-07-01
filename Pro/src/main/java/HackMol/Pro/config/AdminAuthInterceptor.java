package HackMol.Pro.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class AdminAuthInterceptor implements HandlerInterceptor {

    @Value("${admin.secret-key}")
    private String adminSecretKey;

    @Value("${admin.email}")
    private String adminEmail;

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper;

    public AdminAuthInterceptor() {
        this.objectMapper = new ObjectMapper();
        com.fasterxml.jackson.core.StreamReadConstraints constraints = com.fasterxml.jackson.core.StreamReadConstraints.builder()
                .maxNestingDepth(20)
                .maxStringLength(1024 * 1024)
                .build();
        this.objectMapper.getFactory().setStreamReadConstraints(constraints);
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Handle OPTIONS request for CORS preflight
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String authHeader = request.getHeader("Authorization");
        String customHeader = request.getHeader("X-Admin-Token");

        String token = null;
        if (customHeader != null) {
            token = customHeader;
        } else if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }

        if (token == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Unauthorized: Missing auth token");
            return false;
        }

        // Sanitize and validate token format to prevent malicious URL construction/parameter injection
        if (token.length() > 2048 || !token.matches("^[a-zA-Z0-9_\\.\\-\\+\\/\\=]+$")) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("Bad Request: Invalid token format");
            return false;
        }

        // 1. Check if it's the static secret key
        if (token.equals(adminSecretKey)) {
            return true;
        }

        // 2. Otherwise, treat as Google ID token and verify via Google API
        try {
            String verifyUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" + token;
            HttpRequest verifyRequest = HttpRequest.newBuilder()
                    .uri(URI.create(verifyUrl))
                    .GET()
                    .build();

            HttpResponse<String> verifyResponse = httpClient.send(verifyRequest, HttpResponse.BodyHandlers.ofString());

            if (verifyResponse.statusCode() != 200) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Unauthorized: Invalid Google ID token");
                return false;
            }

            JsonNode jsonNode = objectMapper.readTree(verifyResponse.body());
            String email = jsonNode.has("email") ? jsonNode.get("email").asText() : "";
            
            if (email.isEmpty() || !email.equalsIgnoreCase(adminEmail)) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.getWriter().write("Forbidden: User email " + email + " is not authorized as admin");
                return false;
            }

            return true;
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("Internal Server Error: Token validation failed: " + e.getMessage());
            return false;
        }
    }
}
