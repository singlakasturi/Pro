package HackMol.Pro.controller;

import HackMol.Pro.dto.CodeDTO;
import HackMol.Pro.services.CodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/contest/{contestId}/questions/{questionId}")
@CrossOrigin()
public class CodeController {

    private final CodeService codeService;

    @Autowired
    public CodeController(CodeService codeService) {
        this.codeService = codeService;
    }

    @GetMapping("/code/{submissionId}")
    public ResponseEntity<CodeDTO> getCodeBySubmissionId(@PathVariable String submissionId) {
        CodeDTO code = codeService.getCodeBySubmissionId(submissionId);
        return (code != null) ? ResponseEntity.ok(code) : ResponseEntity.notFound().build();
    }
}
