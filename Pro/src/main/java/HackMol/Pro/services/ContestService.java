package HackMol.Pro.services;

import HackMol.Pro.dto.ContestDTO;
import HackMol.Pro.model.Contest;
import HackMol.Pro.repository.ContestRepository;
import org.springframework.beans.factory.annotation.Autowired;
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
        List<Contest> contests = contestRepository.findAll();
        List<ContestDTO> contestDTOs = new ArrayList<>();
        for (Contest contest : contests) {
            contestDTOs.add(convertToDTO(contest));
        }
        return contestDTOs;
    }

    public ContestDTO getContestById(String contestId) {
        Optional<Contest> contest = contestRepository.findById(contestId);
        return contest.map(this::convertToDTO).orElse(null);
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
        return Arrays.asList(restTemplate.getForObject(externalAPIurl, String[].class));
    }
}
