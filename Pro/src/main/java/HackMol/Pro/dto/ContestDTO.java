package HackMol.Pro.dto;

import HackMol.Pro.controller.ContestController;
import HackMol.Pro.model.Difficulty;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;
import lombok.Getter;

import java.time.LocalDateTime;

@Data
public class ContestDTO {
    private String contestId;
    private String title;
    @JsonProperty("startDate")
    private LocalDateTime startDate;
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
        this.startDate = startTime;
        this.participantCount = participantCount;
    }

    public ContestDTO(String contestId, String title, Integer totalSubmissions) {
        this.contestId = contestId;
        this.title = title;
    }



    @Enumerated(EnumType.STRING)
    @JsonIgnore
    private Difficulty difficulty;

    @JsonIgnore
    private Integer totalAccepted;

    @JsonIgnore
    private Integer usersAccepted;

    public String getContestId(){
        return this.contestId;
    }

    public void setContestId(String contestId){
        this.contestId = contestId;
    }

    public LocalDateTime getStartDate(){
        return this.startDate;
    }

    public void setStartDate(LocalDateTime startDate){
        this.startDate = startDate;
    }

    public Integer getParticipantCount(){
        return this.participantCount;
    }

    public void setParticipantCount(Integer participantCount){
        this.participantCount = participantCount;
    }

    public String getTitle(){
        return this.title;
    }

    public void setTitle(String title){
        this.title = title;
    }

    public Difficulty getDifficulty(){
        return this.difficulty;
    }

    public void setDifficulty(Difficulty difficulty){
        this.difficulty = difficulty;
    }

    public Integer getTotalAccepted(){
        return this.totalAccepted;
    }

    public void setTotalAccepted(Integer totalAccepted){
        this.totalAccepted = totalAccepted;
    }

    public Integer getUsersAccepted(){
        return this.usersAccepted;
    }

    public void setUsersAccepted(Integer usersAccepted){
        this.usersAccepted = usersAccepted;
    }

}
