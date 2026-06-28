package HackMol.Pro;

import HackMol.Pro.services.EmailService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class EmailServiceTest {

    @Autowired
    private EmailService emailService;

    @Test
    void testSendEmail() {
        try {
            System.out.println("=== STARTING EMAIL TEST ===");
            emailService.sendContactEmail("Test User", "testsender@example.com", "This is a test message to verify the email service.");
            System.out.println("=== EMAIL SENT SUCCESSFULLY ===");
        } catch (Exception e) {
            System.err.println("=== EMAIL SENDING FAILED ===");
            e.printStackTrace();
        }
    }
}
