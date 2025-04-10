package HackMol.Pro.controller;

import HackMol.Pro.dto.QuestionDTO;
import HackMol.Pro.services.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;
import java.util.List;

@RestController
@RequestMapping("/contests/{contestId}")
@CrossOrigin()
public class QuestionController {
    private final QuestionService questionService;

    @Autowired
    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @GetMapping("/questions")
    public ResponseEntity<List<QuestionDTO>> getQuestionsByContestId(@PathVariable String contestId) {
        List<QuestionDTO> questions = questionService.getQuestionsByContestId(contestId);
        if (questions != null && !questions.isEmpty()) {
            return ResponseEntity.ok(questions);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
