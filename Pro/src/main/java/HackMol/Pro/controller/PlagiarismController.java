package HackMol.Pro.controller;

import HackMol.Pro.model.PlagiarismMatch;
import HackMol.Pro.services.PlagiarismService;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/plagiarism")
@CrossOrigin
public class PlagiarismController {

    private final PlagiarismService plagiarismService;

    @Value("${app.base-url}")
    private String appBaseUrl;

    @Autowired
    public PlagiarismController(PlagiarismService plagiarismService) {
        this.plagiarismService = plagiarismService;
    }

    @PostMapping("/run/{questionId}")
    public ResponseEntity<List<PlagiarismMatch>> runPlagiarism(@PathVariable Integer questionId) {
        List<PlagiarismMatch> results = plagiarismService.runPlagiarismCheck(questionId);
        return ResponseEntity.ok(results);
    }

    @PostMapping("/run/range")
    public ResponseEntity<?> runPlagiarismForRange(
            @RequestParam("start") int start,
            @RequestParam("end") int end,
            @RequestParam(value = "type", defaultValue = "weekly") String type) {
        if (start < 1 || end < 1 || start > 10000 || end > 10000) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid contest range. Numbers must be between 1 and 10000."));
        }
        if (!"weekly".equalsIgnoreCase(type) && !"biweekly".equalsIgnoreCase(type)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid type. Must be 'weekly' or 'biweekly'."));
        }
        if (start > end) {
            return ResponseEntity.badRequest().body(Map.of("error", "Start contest must be less than or equal to end contest."));
        }

        List<String> missing = plagiarismService.getMissingContests(start, end, type);
        if (!missing.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", "missing_contests",
                "missing", missing,
                "message", "Some contests are not present in the database: " + String.join(", ", missing)
            ));
        }

        new Thread(() -> {
            try {
                plagiarismService.runPlagiarismCheckForRange(start, end, type);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }).start();

        return ResponseEntity.ok(Map.of("message", "Plagiarism check job triggered successfully for " + type + " contests " + start + " to " + end));
    }

    @GetMapping("/submissions/{submissionId}")
    public ResponseEntity<List<SimilarSolutionDTO>> getSimilarSubmissions(@PathVariable String submissionId) {
        List<PlagiarismMatch> matches = plagiarismService.getMatchesForSubmission(submissionId);
        List<SimilarSolutionDTO> dtos = new ArrayList<>();

        int rankCounter = 1;
        for (PlagiarismMatch match : matches) {
            String otherSubId;
            String otherUsername;

            if (match.getSubmissionId1().equals(submissionId)) {
                otherSubId = match.getSubmissionId2();
                otherUsername = match.getUsername2();
            } else {
                otherSubId = match.getSubmissionId1();
                otherUsername = match.getUsername1();
            }

            // Construct code path URL pointing to the GET /code/{submissionId} API
            String codePath = String.format("%s/contest/%s/questions/%d/code/%s",
                    appBaseUrl, match.getContestId(), match.getQuestionId(), otherSubId);

            String formattedSimilarity = String.format(Locale.US, "%.1f%%", match.getSimilarity());
            String otherLanguage = plagiarismService.getSubmissionLanguage(otherSubId);

            dtos.add(new SimilarSolutionDTO(
                    String.valueOf(rankCounter++),
                    otherUsername,
                    otherLanguage,
                    formattedSimilarity,
                    codePath
            ));
        }

        return ResponseEntity.ok(dtos);
    }

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SimilarSolutionDTO {
        private String rank;
        private String username;
        private String language;
        private String similarity;
        private String codePath;
    }
}
