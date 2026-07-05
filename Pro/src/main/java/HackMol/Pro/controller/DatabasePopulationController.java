package HackMol.Pro.controller;

import HackMol.Pro.model.Contest;
import HackMol.Pro.model.Question;
import HackMol.Pro.model.Difficulty;
import HackMol.Pro.model.Submission;
import HackMol.Pro.model.Code;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;
import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin
public class DatabasePopulationController {

    @Value("${admin.secret-key}")
    private String adminSecretKey;

    @Value("${scraper.python-path}")
    private String scraperPythonPath;

    @Value("${scraper.script-path}")
    private String scraperScriptPath;

    @Value("${scraper.work-dir}")
    private String scraperWorkDir;

    @Value("${scraper.api-base-url}")
    private String scraperApiBaseUrl;

    @PersistenceContext
    private EntityManager entityManager;

    @org.springframework.beans.factory.annotation.Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @PostMapping("/admin/scrape")
    public ResponseEntity<String> triggerScrape(
            @RequestParam("start") int start,
            @RequestParam("end") int end,
            @RequestParam(value = "type", defaultValue = "weekly") String type) {
        if (start < 1 || end < 1 || start > 10000 || end > 10000) {
            return ResponseEntity.badRequest().body("Invalid contest range. Numbers must be between 1 and 10000.");
        }
        if (!"weekly".equalsIgnoreCase(type) && !"biweekly".equalsIgnoreCase(type)) {
            return ResponseEntity.badRequest().body("Invalid type. Must be 'weekly' or 'biweekly'.");
        }
        if (start > end) {
            return ResponseEntity.badRequest().body("Start contest must be less than or equal to end contest.");
        }
        
        new Thread(() -> {
            try {
                String pythonExe = scraperPythonPath;
                String scriptPath = scraperScriptPath;
                String workDir = scraperWorkDir;
                
                ProcessBuilder pb = new ProcessBuilder(pythonExe, scriptPath);
                pb.directory(new File(workDir));
                
                Map<String, String> env = pb.environment();
                String prefix = "biweekly".equalsIgnoreCase(type) ? "biweekly-contest-" : "weekly-contest-";
                env.put("CONTEST_SLUG", prefix + start + ".." + prefix + end);
                env.put("API_BASE_URL", scraperApiBaseUrl);
                env.put("ADMIN_SECRET_KEY", adminSecretKey);
                
                pb.redirectErrorStream(true);
                Process process = pb.start();
                
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        System.out.println("[Scraper] " + line);
                    }
                }
                int exitCode = process.waitFor();
                System.out.println("[Scraper] Finished with exit code: " + exitCode);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }).start();
        
        return ResponseEntity.ok("Scraper job triggered successfully for " + type + " contests " + start + " to " + end);
    }

    private String formatContestTitle(String slug) {
        String num = slug.replaceAll("[^0-9]", "");
        if (slug.startsWith("biweekly-contest-")) {
            return "LeetCode Biweekly Contest " + num;
        } else if (slug.startsWith("weekly-contest-")) {
            return "LeetCode Weekly Contest " + num;
        }
        if (slug.contains("-")) {
            String[] parts = slug.split("-");
            StringBuilder sb = new StringBuilder("LeetCode");
            for (String part : parts) {
                if (!part.isEmpty()) {
                    sb.append(" ").append(Character.toUpperCase(part.charAt(0))).append(part.substring(1));
                }
            }
            return sb.toString();
        }
        return "LeetCode " + slug;
    }

    private LocalDateTime calculateContestDate(String slug) {
        try {
            if (slug.startsWith("weekly-contest-")) {
                int number = Integer.parseInt(slug.replace("weekly-contest-", ""));
                // Weekly Contest 507 was on Sunday, June 21, 2026
                return LocalDateTime.of(2026, 6, 21, 8, 0, 0).minusWeeks(507 - number);
            } else if (slug.startsWith("biweekly-contest-")) {
                int number = Integer.parseInt(slug.replace("biweekly-contest-", ""));
                // Biweekly Contest 141 was on Saturday, October 12, 2024
                return LocalDateTime.of(2024, 10, 12, 20, 0, 0).minusWeeks((141 - number) * 2L);
            }
        } catch (Exception e) {
            // fallback
        }
        return LocalDateTime.now();
    }

    @PostMapping("/contests")
    @Transactional
    public ResponseEntity<Void> populateContest(
            @RequestParam("id") Integer id,
            @RequestParam("slug") String slug,
            @RequestParam(value = "participantCount", required = false) Integer participantCount) {
        Contest contest = entityManager.find(Contest.class, slug);
        LocalDateTime contestDate = calculateContestDate(slug);
        if (contest == null) {
            contest = new Contest();
            contest.setContestId(slug);
            contest.setTitle(formatContestTitle(slug));
            contest.setStartDate(contestDate);
            contest.setParticipantCount(participantCount != null ? participantCount : 0);
            entityManager.persist(contest);
        } else {
            contest.setTitle(formatContestTitle(slug));
            contest.setStartDate(contestDate);
            if (participantCount != null) {
                contest.setParticipantCount(participantCount);
            }
            entityManager.merge(contest);
        }
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Data
    public static class QuestionPopulateDTO {
        private Integer id;
        private String name;
        private Integer numberInContest;
        private String contestSlug;
        private String description;
        private Integer number;
    }

    @PostMapping("/question")
    @Transactional
    public ResponseEntity<Void> populateQuestion(@RequestBody QuestionPopulateDTO dto) {
        Contest contest = entityManager.find(Contest.class, dto.getContestSlug());
        if (contest == null) {
            contest = new Contest();
            contest.setContestId(dto.getContestSlug());
            contest.setTitle(formatContestTitle(dto.getContestSlug()));
            contest.setStartDate(calculateContestDate(dto.getContestSlug()));
            contest.setParticipantCount(0);
            entityManager.persist(contest);
        }

        Question question = entityManager.find(Question.class, dto.getId());
        if (question == null) {
            question = new Question();
            question.setQuestionId(dto.getId());
            question.setContest(contest);
            question.setQuestionNumber(dto.getNumberInContest());
            question.setTitle(dto.getName());
            question.setPoint(5);
            question.setDifficulty(Difficulty.MEDIUM);
            question.setTotalSubmissions(0);
            question.setTotalAccepted(0);
            question.setUsersAccepted(0);
            entityManager.persist(question);
        } else {
            question.setContest(contest);
            question.setQuestionNumber(dto.getNumberInContest());
            question.setTitle(dto.getName());
            entityManager.merge(question);
        }
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Data
    public static class SubmissionPopulateDTO {
        private String id;
        private Long date;
        private String code;
        private String language;
        private Integer page;
        private String userSlug;
        private Integer questionId;
    }

    @PostMapping("/submissions/bulk")
    @Transactional
    public ResponseEntity<Void> populateSubmissions(@RequestBody List<SubmissionPopulateDTO> dtos) {
        if (dtos.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.OK);
        }

        // 1. Batch upsert into submission table
        String submissionSql = "INSERT INTO submission (submission_id, username, question_id, language, submission_date) " +
                "VALUES (?, ?, ?, ?, ?) " +
                "ON CONFLICT (submission_id) " +
                "DO UPDATE SET username = EXCLUDED.username, question_id = EXCLUDED.question_id, " +
                "language = EXCLUDED.language, submission_date = EXCLUDED.submission_date";

        jdbcTemplate.batchUpdate(submissionSql, new org.springframework.jdbc.core.BatchPreparedStatementSetter() {
            @Override
            public void setValues(java.sql.PreparedStatement ps, int i) throws java.sql.SQLException {
                SubmissionPopulateDTO dto = dtos.get(i);
                ps.setString(1, dto.getId());
                ps.setString(2, dto.getUserSlug());
                ps.setInt(3, dto.getQuestionId());
                ps.setString(4, dto.getLanguage());
                
                LocalDateTime submissionDate = LocalDateTime.ofInstant(
                        Instant.ofEpochSecond(dto.getDate()), ZoneId.systemDefault()
                );
                ps.setTimestamp(5, java.sql.Timestamp.valueOf(submissionDate));
            }

            @Override
            public int getBatchSize() {
                return dtos.size();
            }
        });

        // 2. Batch upsert into code table
        String codeSql = "INSERT INTO code (submission_id, submitted_code) " +
                "VALUES (?, ?) " +
                "ON CONFLICT (submission_id) " +
                "DO UPDATE SET submitted_code = EXCLUDED.submitted_code";

        jdbcTemplate.batchUpdate(codeSql, new org.springframework.jdbc.core.BatchPreparedStatementSetter() {
            @Override
            public void setValues(java.sql.PreparedStatement ps, int i) throws java.sql.SQLException {
                SubmissionPopulateDTO dto = dtos.get(i);
                ps.setString(1, dto.getId());
                ps.setString(2, dto.getCode());
            }

            @Override
            public int getBatchSize() {
                return dtos.size();
            }
        });

        return new ResponseEntity<>(HttpStatus.OK);
    }
}
