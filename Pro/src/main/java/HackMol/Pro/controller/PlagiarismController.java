package HackMol.Pro.controller;

import HackMol.Pro.model.PlagiarismMatch;
import HackMol.Pro.services.PlagiarismService;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/api/v1/plagiarism")
@CrossOrigin
public class PlagiarismController {

    private final PlagiarismService plagiarismService;

    @Autowired
    public PlagiarismController(PlagiarismService plagiarismService) {
        this.plagiarismService = plagiarismService;
    }

    @PostMapping("/run/{questionId}")
    public ResponseEntity<List<PlagiarismMatch>> runPlagiarism(@PathVariable Integer questionId) {
        List<PlagiarismMatch> results = plagiarismService.runPlagiarismCheck(questionId);
        return ResponseEntity.ok(results);
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
            String codePath = String.format("http://localhost:8080/contest/%s/questions/%d/code/%s",
                    match.getContestId(), match.getQuestionId(), otherSubId);

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
