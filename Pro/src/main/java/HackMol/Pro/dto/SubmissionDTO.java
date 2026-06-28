package HackMol.Pro.dto;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SubmissionDTO {
    private String submissionId;
    private String username;
    @JsonProperty("questionId")
    private Integer questionId;
    private String language;
    private LocalDateTime submissionDate;

    public SubmissionDTO() {}

    public SubmissionDTO(String submissionId, String username, Integer questionId, String language, LocalDateTime submissionDate) {
        this.submissionId = submissionId;
        this.username = username;
        this.questionId = questionId;
        this.language = language;
        this.submissionDate = submissionDate;
    }

    public SubmissionDTO(String username, Integer questionId, String language, LocalDateTime submissionDate) {
        this.username = username;
        this.questionId = questionId;
        this.language = language;
        this.submissionDate = submissionDate;
    }

    public String getusername() {
        return username;
    }

    public void setusername(String username) {
        this.username = username;
    }

    public Integer getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Integer questionId) {
        this.questionId = questionId;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public LocalDateTime getSubmissionDate() {
        return submissionDate;
    }

    public void setSubmissionDate(LocalDateTime submissionDate) {
        this.submissionDate = submissionDate;
    }
}