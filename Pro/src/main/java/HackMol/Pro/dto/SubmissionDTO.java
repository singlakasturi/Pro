package HackMol.Pro.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.Getter;
import HackMol.Pro.controller.SubmissionsController;

import java.time.LocalDateTime;

@Data
public class SubmissionDTO {
    private String username;
    private Integer rank;
    private String language;

    @JsonProperty("submissionTime")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime submissionTime;

    public SubmissionDTO(String username, Integer rank, String language, LocalDateTime submissionTime) {
        this.username = username;
        this.rank = rank;
        this.language = language;
        this.submissionTime = submissionTime;
    }


}
