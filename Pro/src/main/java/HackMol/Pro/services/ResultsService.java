package HackMol.Pro.services;


import HackMol.Pro.dto.SubmissionDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Arrays;
import java.util.List;

@Service
public class ResultsService {
    private final RestTemplate restTemplate;


    @Autowired
    public ResultsService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Value("${external.api.submissions.url}")
    private String externalAPIurl;

    public List<SubmissionDTO> getSubmissionsByQuestionId(Integer questionId) {
        String url = externalAPIurl + questionId;
        SubmissionDTO[] submissionsArray = restTemplate.getForObject(url, SubmissionDTO[].class);
        return Arrays.asList(submissionsArray);
    }


    public SubmissionDTO getSubmissionByUserNameAndQuestionId(Integer questionId, String userName) {
        String url = UriComponentsBuilder.fromHttpUrl(externalAPIurl)
                .queryParam("questionId", questionId)
                .queryParam("userName", userName)
                .toUriString();

        return restTemplate.getForObject(url, SubmissionDTO.class);
    }


}