package HackMol.Pro.controller;

import HackMol.Pro.dto.CodeDTO;
import HackMol.Pro.services.CodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping()
@CrossOrigin()
public class CodeController {

    private CodeService codeService;

    @Autowired
    public CodeController(CodeService codesService) {
        this.codeService = codesService;
    }

    @GetMapping("/code/{submissionId}")
    public ResponseEntity<CodeDTO> getCodeBySubmissionId(@PathVariable String submissionId) {
        CodeDTO code = codeService.getCodeBySubmissionId(submissionId);
        if (code != null) {
            return ResponseEntity.ok(code);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}