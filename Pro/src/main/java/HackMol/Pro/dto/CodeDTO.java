package HackMol.Pro.dto;

public class CodeDTO {
    private String submissionId;
    private String submittedCode;

    public CodeDTO() {
    }

    public CodeDTO(String submissionId, String submittedCode) {
        this.submissionId = submissionId;
        this.submittedCode = submittedCode;
    }

    public String getSubmittedCode() {
        return submittedCode;
    }

    public void setSubmittedCode(String submittedCode) {
        this.submittedCode = submittedCode;
    }

    public String getSubmissionId() {
        return submissionId;
    }

    public void setSubmissionId(String submissionId) {
        this.submissionId = submissionId;
    }
}
