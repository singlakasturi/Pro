package HackMol.Pro.services;

import HackMol.Pro.dto.QuestionDTO;
import HackMol.Pro.model.Question;
import HackMol.Pro.repository.ContestRepository;
import HackMol.Pro.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final ContestRepository contestRepository;
    private final RestTemplate restTemplate;

    @Value("${external.api.questions.url}")
    private String externalAPIurl;


    @Autowired
    public QuestionService(QuestionRepository questionRepository, ContestRepository contestRepository, RestTemplate restTemplate) {
        this.questionRepository = questionRepository;
        this.contestRepository = contestRepository;
        this.restTemplate = restTemplate;
    }

    public List<QuestionDTO> getQuestionsByContestId(String contestId) {
        String url = externalAPIurl + contestId;

        ResponseEntity<List<QuestionDTO>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<>() {
                }
        );

        return response.getBody();
    }

    public QuestionDTO getQuestionById(String contestId, Integer questionId) {
        List<QuestionDTO> questions = getQuestionsByContestId(contestId);
        if (questions == null) return null;

        for (QuestionDTO question : questions) {
            if (question.getQuestionId().equals(questionId)) {
                return question;
            }
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
