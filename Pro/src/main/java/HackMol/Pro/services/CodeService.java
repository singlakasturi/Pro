package HackMol.Pro.services;

import HackMol.Pro.dto.CodeDTO;
import HackMol.Pro.model.Code;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class CodeService {

    @Value("${external.api.codes.url}")
    private String externalCodeApiUrl;

    private final RestTemplate restTemplate;

    public CodeService() {
        this.restTemplate = new RestTemplate();
    }

    public CodeDTO getCodeBySubmissionId(String submissionId) {
        String url = externalCodeApiUrl + "/" + submissionId;

        try {
            Code code = restTemplate.getForObject(url, Code.class);
            return (code != null) ? convertToDTO(code) : null;
        } catch (Exception e) {
            return null;
        }
    }

    private CodeDTO convertToDTO(Code code) {
        return new CodeDTO(code.getSubmissionId(), code.getSubmittedCode());
    }
}
