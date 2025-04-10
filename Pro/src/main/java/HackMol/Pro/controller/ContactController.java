package HackMol.Pro.controller;

import HackMol.Pro.services.EmailService;
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
    public ResponseEntity<String> submitContactForm(@RequestBody ContactRequest contactRequest) {
        try {
            emailService.sendContactEmail(contactRequest.getName(), contactRequest.getEmail(), contactRequest.getMessage());
            return ResponseEntity.ok("Email Sent Successfully");
        }
        catch(Exception e) {
            return ResponseEntity.status(500).body("Failed to send Message");
        }
    }

    @Data
    class ContactRequest {
        private String name;
        private String email;
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