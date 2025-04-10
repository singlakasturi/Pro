package HackMol.Pro.controller;

import HackMol.Pro.dto.ContestDTO;
import HackMol.Pro.services.ContestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/contests")
@CrossOrigin()
public class ContestController {

    private ContestService contestService;

    public ContestController(ContestService contestService) {
        this.contestService = contestService;
    }

    @GetMapping
    public ResponseEntity<List<ContestDTO>> getAllContests() {
        List<ContestDTO> contests = contestService.getAllContests();
        return ResponseEntity.ok(contests);
    }

    @GetMapping("/{contestId}")
    public ResponseEntity<ContestDTO> getContestById(@PathVariable String contestId) {
        ContestDTO contest = contestService.getContestById(contestId);
        if (contest != null) {
            return ResponseEntity.ok(contest);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}