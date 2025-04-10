package HackMol.Pro.dto;


import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SubmissionDTO {
    private String userName;
    private Integer questionId;
    private String language;
    private LocalDateTime submissionDate;

    public SubmissionDTO(String userName, Integer questionId, String language, LocalDateTime submissionDate) {
        this.userName = userName;
        this.questionId = questionId;
        this.language = language;
        this.submissionDate = submissionDate;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
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
