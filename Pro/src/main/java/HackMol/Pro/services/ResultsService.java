package HackMol.Pro.services;

import HackMol.Pro.dto.ContestDTO;
import HackMol.Pro.dto.SubmissionDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class ResultsService {

    private final RestTemplate restTemplate;

    @Value("${external.api.submissions.url}")
    private String externalAPIurl;

    @Autowired
    public ResultsService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }


    public List<SubmissionDTO> getSubmissionsByQuestionId(Integer questionId) {
        String url = UriComponentsBuilder.fromHttpUrl(externalAPIurl)
                .queryParam("questionId", questionId)
                .toUriString();

        try {
            ResponseEntity<List<SubmissionDTO>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<SubmissionDTO>>() {}
            );

            return response.getBody() != null ? response.getBody() : new ArrayList<>();
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }


    public SubmissionDTO getSubmissionByUserNameAndQuestionId(Integer questionId, String userName) {
        String url = UriComponentsBuilder.fromHttpUrl(externalAPIurl)
                .queryParam("questionId", questionId)
                .queryParam("userName", userName)
                .toUriString();

        try {
            return restTemplate.getForObject(url, SubmissionDTO.class);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}