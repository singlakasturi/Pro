package HackMol.Pro.services;

import HackMol.Pro.dto.ContestDTO;
import HackMol.Pro.model.Contest;
import HackMol.Pro.repository.ContestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ContestService {

    private final ContestRepository contestRepository;

    @Autowired
    public ContestService(ContestRepository contestRepository) {
        this.contestRepository = contestRepository;
    }

    public List<ContestDTO> getAllContests() {
        try {
            return contestRepository.findAllByOrderByStartDateDesc().stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    public ContestDTO getContestById(String contestId) {
        Optional<Contest> optionalContest = contestRepository.findById(contestId);
        return optionalContest.map(this::convertToDTO).orElse(null);
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
            return contestRepository.findAllContestIds();
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
}

