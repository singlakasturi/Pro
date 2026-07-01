package HackMol.Pro.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender emailSender;

    @Value("${admin.email.mail}")
    private String adminEmail;

    public void sendContactEmail(String name, String fromEmail, String message) {
        if (emailSender == null) {
            System.out.println("[Warning] Email sender is not configured. Email from " + name + " was not sent.");
            return;
        }
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(adminEmail);
        mailMessage.setSubject("Contact Form Submission from " + name);
        mailMessage.setText("Sender Email: " + fromEmail + "\n\nMessage: " + message);

        emailSender.send(mailMessage);
    }
}
