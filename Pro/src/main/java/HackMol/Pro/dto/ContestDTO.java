package HackMol.Pro.dto;

import HackMol.Pro.controller.ContestController;
import HackMol.Pro.model.Difficulty;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

import java.time.LocalDateTime;

public class ContestDTO {
    private String contestId;
    private LocalDateTime startTime;
    private Integer participantCount;

    public ContestDTO(){}

    public ContestDTO(String contestId, String title, LocalDateTime startTime, Integer participantCount) {
        this.contestId = contestId;
        this.title = title;
        this.startTime = startTime;
        this.participantCount = participantCount;
    }

    public ContestDTO(String contestId, String title) {
        this.contestId = contestId;
        this.title = title;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public String getContestId() {
        return contestId;
    }

    public void setContestId(String contestId) {
        this.contestId = contestId;
    }

    public Integer getParticipantCount() {
        return participantCount;
    }

    public void setParticipantCount(Integer participantCount) {
        this.participantCount = participantCount;
    }

    private String title;

    @Enumerated(EnumType.STRING)
    private Difficulty difficulty;

    private Integer totalSubmissions;

    private Integer totalAccepted;

    private Integer usersAccepted;


}
