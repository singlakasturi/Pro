package HackMol.Pro.controller;

import HackMol.Pro.services.EmailService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping
@CrossOrigin()
public class ContactController {

    @Autowired
    EmailService emailService;

    @PostMapping("/contact")
    public ResponseEntity<String> submitContactForm(@Valid @RequestBody ContactRequest contactRequest) {
        try {
            emailService.sendContactEmail(contactRequest.getName(), contactRequest.getEmail(), contactRequest.getMessage());
            return ResponseEntity.ok("Email Sent Successfully");
        }
        catch(Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to send Message");
        }
    }

    @Data
    public static class ContactRequest {
        @NotBlank(message = "Name is required")
        @Size(max = 100, message = "Name must not exceed 100 characters")
        private String name;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        @Size(max = 255, message = "Email must not exceed 255 characters")
        private String email;

        @NotBlank(message = "Message is required")
        @Size(max = 5000, message = "Message must not exceed 5000 characters")
        private String message;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}