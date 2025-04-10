package HackMol.Pro.services;

import HackMol.Pro.dto.QuestionDTO;
import HackMol.Pro.model.Question;
import HackMol.Pro.repository.ContestRepository;
import HackMol.Pro.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository; // Fixed naming
    private final ContestRepository contestRepository;

    @Autowired
    public QuestionService(QuestionRepository questionRepository, ContestRepository contestRepository) {
        this.questionRepository = questionRepository;
        this.contestRepository = contestRepository;
    }

    public List<QuestionDTO> getQuestionsByContestId(String contestId) {
        List<Question> questions = questionRepository.findByContestContestId(contestId);
        List<QuestionDTO> questionDTOs = new ArrayList<>();

        for (Question question : questions) {
            questionDTOs.add(convertToDTO(question));
        }

        return questionDTOs;
    }

    public QuestionDTO getQuestionById(Integer questionId) {
        Optional<Question> question = questionRepository.findById(questionId);
        return question.map(this::convertToDTO).orElse(null); // Cleaner Optional usage
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
