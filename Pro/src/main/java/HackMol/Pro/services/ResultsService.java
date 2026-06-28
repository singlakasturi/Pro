package HackMol.Pro.services;

import HackMol.Pro.dto.SubmissionDTO;
import HackMol.Pro.model.Submission;
import HackMol.Pro.repository.SubmissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ResultsService {

    private final SubmissionRepository submissionRepository;

    @Autowired
    public ResultsService(SubmissionRepository submissionRepository) {
        this.submissionRepository = submissionRepository;
    }

    public List<SubmissionDTO> getSubmissionsByQuestionId(Integer questionId) {
        try {
            return submissionRepository.findByQuestionId(questionId).stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    public SubmissionDTO getSubmissionByUserNameAndQuestionId(Integer questionId, String userName) {
        try {
            Optional<Submission> submission = submissionRepository.findByQuestionIdAndUsername(questionId, userName);
            return submission.map(this::convertToDTO).orElse(null);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    private SubmissionDTO convertToDTO(Submission submission) {
        return new SubmissionDTO(
                submission.getSubmissionId(),
                submission.getUsername(),
                submission.getQuestionId(),
                submission.getLanguage(),
                submission.getSubmissionDate()
        );
    }
}