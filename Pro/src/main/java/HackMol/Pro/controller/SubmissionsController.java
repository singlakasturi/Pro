package HackMol.Pro.controller;

import HackMol.Pro.dto.ContestDTO;
import HackMol.Pro.dto.SubmissionDTO;
import HackMol.Pro.services.ResultsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/contests/{contestId}/questions/{questionId}")
@CrossOrigin
public class SubmissionsController {

    private final ResultsService resultsService;

    @Autowired
    public SubmissionsController(ResultsService resultsService) {
        this.resultsService = resultsService;
    }

    @GetMapping
    public ResponseEntity<List<SubmissionDTO>> getSubmissionsByQuestionId(
            @PathVariable String contestId,
            @PathVariable Integer questionId) {

        List<SubmissionDTO> submissions = resultsService.getSubmissionsByQuestionId(questionId);
        return ResponseEntity.ok(submissions);
    }

    @GetMapping("/solution/{userName}")
    public ResponseEntity<SubmissionDTO> getSubmissionByUserNameAndQuestionId(
            @PathVariable String contestId,
            @PathVariable Integer questionId,
            @PathVariable String userName) {

        SubmissionDTO submission = resultsService.getSubmissionByUserNameAndQuestionId(questionId, userName);

        if (submission != null) {
                return ResponseEntity.ok(submission);
            } else {
                return ResponseEntity.status(204).build();
        }
    }
}
