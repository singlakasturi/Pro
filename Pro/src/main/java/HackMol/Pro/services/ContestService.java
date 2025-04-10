package HackMol.Pro.services;

import HackMol.Pro.dto.ContestDTO;
import HackMol.Pro.dto.QuestionDTO;
import HackMol.Pro.model.Contest;
import HackMol.Pro.repository.ContestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ContestService {

    private final ContestRepository contestRepository;
    private final RestTemplate restTemplate;

    @Value("${external.api.contests.url}")
    private String externalAPIurl;

    @Autowired
    public ContestService(ContestRepository contestRepository, RestTemplate restTemplate) {
        this.contestRepository = contestRepository;
        this.restTemplate = restTemplate;
    }

    public List<ContestDTO> getAllContests() {
        try {
            ResponseEntity<List<ContestDTO>> response = restTemplate.exchange(
                    externalAPIurl,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<ContestDTO>>() {}
            );

            return response.getBody() != null ? response.getBody() : new ArrayList<>();
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }


    public ContestDTO getContestById(String contestId) {
        Optional<Contest> optionalContest = contestRepository.findById(contestId);
        if (optionalContest.isPresent()) {
            return convertToDTO(optionalContest.get());
        }

        List<ContestDTO> contests = getAllContests();
        for (ContestDTO contest : contests) {
            if (contestId.equals(contest.getContestId())) {
                return contest;
            }
        }

        return null;
    }

    private ContestDTO convertToDTO(Contest contest) {
        return new ContestDTO(
                contest.getContestId(),
                contest.getTitle(),
                contest.getStartTime(),
                contest.getParticipantCount()
        );
    }

    public List<String> getExternalContestIds() {
        try {
            ResponseEntity<List<ContestDTO>> response = restTemplate.exchange(
                    externalAPIurl,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<ContestDTO>>() {}
            );

            List<ContestDTO> contests = response.getBody();
            List<String> ids = new ArrayList<>();

            if (contests != null) {
                for (ContestDTO contest : contests) {
                    ids.add(contest.getContestId());
                }
            }

            return ids;
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
}
