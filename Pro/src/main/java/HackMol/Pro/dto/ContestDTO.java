package HackMol.Pro.dto;

import HackMol.Pro.controller.ContestController;
import HackMol.Pro.model.Difficulty;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;
import lombok.Getter;

import java.time.LocalDateTime;

@Data
public class ContestDTO {
    private String contestId;
    @Getter
    private LocalDateTime startTime;
    private Integer participantCount;

    public ContestDTO(String contestId, String title) {
        this.contestId = contestId;
        this.title = title;
    }
    public ContestDTO() {
    }


    public ContestDTO(String contestId, String title, LocalDateTime startTime, Integer participantCount) {
        this.contestId = contestId;
        this.title = title;
        this.startTime = startTime;
        this.participantCount = participantCount;
    }

    public ContestDTO(String contestId, String title, Integer totalSubmissions) {
        this.contestId = contestId;
        this.title = title;
    }


    private String title;

    @Enumerated(EnumType.STRING)
    private Difficulty difficulty;

    private Integer totalAccepted;

    private Integer usersAccepted;
    
    public String getContestId(){
        return this.contestId;
    }


}
