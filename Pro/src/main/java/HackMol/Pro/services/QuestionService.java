package HackMol.Pro.services;

import HackMol.Pro.dto.QuestionDTO;
import HackMol.Pro.model.Question;
import HackMol.Pro.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;

    @Autowired
    public QuestionService(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    public List<QuestionDTO> getQuestionsByContestId(String contestId) {
        try {
            return questionRepository.findByContestContestId(contestId).stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    public QuestionDTO getQuestionById(String contestId, Integer questionId) {
        Optional<Question> question = questionRepository.findById(questionId);
        if (question.isPresent() && question.get().getContest().getContestId().equals(contestId)) {
            return convertToDTO(question.get());
        }
        return null;
    }

    private QuestionDTO convertToDTO(Question question) {
        return new QuestionDTO(
                question.getQuestionId(),
                question.getContest().getContestId(),
                question.getQuestionNumber(),
                question.getTitle(),
                question.getDifficulty(),
                question.getTotalSubmissions(),
                question.getTotalAccepted(),
                question.getUsersAccepted(),
                question.getPoint()
        );
    }
}

