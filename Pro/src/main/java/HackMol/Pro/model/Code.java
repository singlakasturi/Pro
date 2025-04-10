package HackMol.Pro.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity

public class Code {

    @Id
    private String SubmissionId;

    private String SubmittedCode;

    public Code(){}

    public Code(String submissionId, String submittedCode) {
        this.SubmissionId = submissionId;
        this.SubmittedCode = submittedCode;
    }

    public String getSubmissionId() {
        return SubmissionId;
    }

    public void setSubmissionId(String submissionId) {
        SubmissionId = submissionId;
    }

    public String getSubmittedCode() {
        return SubmittedCode;
    }

    public void setSubmittedCode(String submittedCode) {
        SubmittedCode = submittedCode;
    }
}
