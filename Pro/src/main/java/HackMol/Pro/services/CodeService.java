package HackMol.Pro.services;

import HackMol.Pro.dto.CodeDTO;
import HackMol.Pro.model.Code;
import HackMol.Pro.repository.CodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CodeService {

    private final CodeRepository codeRepository;

    @Autowired
    public CodeService(CodeRepository codeRepository) {
        this.codeRepository = codeRepository;
    }

    public CodeDTO getCodeBySubmissionId(String submissionId) {
        try {
            Optional<Code> code = codeRepository.findById(submissionId);
            return code.map(this::convertToDTO).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    private CodeDTO convertToDTO(Code code) {
        return new CodeDTO(code.getSubmissionId(), code.getSubmittedCode());
    }
}

