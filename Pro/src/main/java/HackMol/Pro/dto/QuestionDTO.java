package HackMol.Pro.dto;

import HackMol.Pro.model.Difficulty;
import com.fasterxml.jackson.annotation.JsonProperty;

public class QuestionDTO {

    private Integer questionId;
    private String contestId;
    private Integer questionNumber;
    private String title;
    private Difficulty difficulty;
    private Integer totalSubmissions;

    private Integer totalAccepted;
    private Integer usersAccepted;
    private Integer point;

    public QuestionDTO() {}

    public QuestionDTO(Integer questionId, String contestId, Integer questionNumber, String title,
                       Difficulty difficulty, Integer totalSubmissions, Integer totalAccepted,
                       Integer usersAccepted, Integer point) {
        this.questionId = questionId;
        this.contestId = contestId;
        this.questionNumber = questionNumber;
        this.title = title;
        this.difficulty = difficulty;
        this.totalSubmissions = totalSubmissions;
        this.totalAccepted = totalAccepted;
        this.usersAccepted = usersAccepted;
        this.point = point;
    }

    public Integer getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Integer questionId) {
        this.questionId = questionId;
    }

    public String getContestId() {
        return contestId;
    }

    public void setContestId(String contestId) {
        this.contestId = contestId;
    }

    public Integer getQuestionNumber() {
        return questionNumber;
    }

    public void setQuestionNumber(Integer questionNumber) {
        this.questionNumber = questionNumber;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Difficulty getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(Difficulty difficulty) {
        this.difficulty = difficulty;
    }

    public Integer getTotalSubmissions() {
        return totalSubmissions;
    }

    public void setTotalSubmissions(Integer totalSubmissions) {
        this.totalSubmissions = totalSubmissions;
    }

    public Integer getTotalAccepted() {
        return totalAccepted;
    }

    public void setTotalAccepted(Integer totalAccepted) {
        this.totalAccepted = totalAccepted;
    }

    public Integer getUsersAccepted() {
        return usersAccepted;
    }

    public void setUsersAccepted(Integer usersAccepted) {
        this.usersAccepted = usersAccepted;
    }

    public Integer getPoint() {
        return point;
    }

    public void setPoint(Integer point) {
        this.point = point;
    }
}
