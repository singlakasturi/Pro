package HackMol.Pro.services;

import HackMol.Pro.model.Code;
import HackMol.Pro.model.PlagiarismMatch;
import HackMol.Pro.model.Question;
import HackMol.Pro.model.Submission;
import HackMol.Pro.repository.CodeRepository;
import HackMol.Pro.repository.PlagiarismMatchRepository;
import HackMol.Pro.repository.QuestionRepository;
import HackMol.Pro.repository.SubmissionRepository;
import de.jplag.JPlag;
import de.jplag.JPlagComparison;
import de.jplag.JPlagResult;
import de.jplag.options.JPlagOptions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PlagiarismService {

    private final SubmissionRepository submissionRepository;
    private final CodeRepository codeRepository;
    private final PlagiarismMatchRepository plagiarismMatchRepository;
    private final QuestionRepository questionRepository;
    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public PlagiarismService(SubmissionRepository submissionRepository,
                             CodeRepository codeRepository,
                             PlagiarismMatchRepository plagiarismMatchRepository,
                             QuestionRepository questionRepository,
                             JdbcTemplate jdbcTemplate) {
        this.submissionRepository = submissionRepository;
        this.codeRepository = codeRepository;
        this.plagiarismMatchRepository = plagiarismMatchRepository;
        this.questionRepository = questionRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional
    public List<PlagiarismMatch> runPlagiarismCheck(Integer questionId) {
        List<PlagiarismMatch> matchesSaved = new ArrayList<>();
        Optional<Question> questionOpt = questionRepository.findById(questionId);
        if (questionOpt.isEmpty()) {
            return matchesSaved;
        }
        Question question = questionOpt.get();
        String contestId = question.getContest().getContestId();

        // 1. Fetch all submissions for this question
        List<Submission> submissions = submissionRepository.findByQuestionId(questionId);
        if (submissions.size() < 2) {
            return matchesSaved;
        }

        // Map submissions by ID for easy lookup later
        Map<String, Submission> submissionMap = submissions.stream()
                .collect(Collectors.toMap(Submission::getSubmissionId, s -> s));

        // Delete old matches for this question
        plagiarismMatchRepository.deleteByQuestionId(questionId);

        // Fetch all code records in one batch query to avoid N+1 SELECT queries
        List<String> subIds = submissions.stream().map(Submission::getSubmissionId).collect(Collectors.toList());
        List<Code> codes = codeRepository.findAllById(subIds);
        Map<String, String> codeMap = codes.stream()
                .filter(c -> c.getSubmittedCode() != null)
                .collect(Collectors.toMap(Code::getSubmissionId, Code::getSubmittedCode));

        // 2. Run a single JPlag comparison across ALL submissions regardless of language
        //    Using the NaturalLanguage (text) parser so it can compare code in any language
        Path tempDir = null;
        try {
            tempDir = Files.createTempDirectory("jplag-run-" + questionId + "-all-");

            // Write each submission's normalized code to a .txt file
            for (Submission sub : submissions) {
                String rawCode = codeMap.get(sub.getSubmissionId());
                if (rawCode != null) {
                    String normalizedCode = normalizeCode(rawCode);
                    Path file = tempDir.resolve(sub.getSubmissionId() + ".txt");
                    Files.writeString(file, normalizedCode);
                }
            }

            // Use NaturalLanguage text parser — works across all programming languages
            de.jplag.Language jplagLanguage = new de.jplag.text.NaturalLanguage();

            JPlagOptions options = new JPlagOptions(
                    jplagLanguage,
                    Set.of(tempDir.toFile()),
                    Set.of()
                );

            JPlag jplag = new JPlag(options);
            JPlagResult result = jplag.run();

            // Process comparison results
            for (JPlagComparison comp : result.getAllComparisons()) {
                double similarity = comp.similarity() * 100.0;

                // We only save matches with similarity >= 50%
                if (similarity >= 50.0) {
                    String subId1 = stripExtension(comp.firstSubmission().getName());
                    String subId2 = stripExtension(comp.secondSubmission().getName());

                    Submission sub1 = submissionMap.get(subId1);
                    Submission sub2 = submissionMap.get(subId2);

                    if (sub1 != null && sub2 != null) {
                        PlagiarismMatch match = new PlagiarismMatch(
                                null,
                                contestId,
                                questionId,
                                subId1,
                                subId2,
                                sub1.getUsername(),
                                sub2.getUsername(),
                                "all",
                                similarity
                        );
                        matchesSaved.add(match);
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (tempDir != null) {
                deleteDirectoryRecursively(tempDir.toFile());
            }
        }

        // Save all matches in batch to database using JdbcTemplate to bypass IDENTITY sequence bottleneck
        if (!matchesSaved.isEmpty()) {
            String sql = "INSERT INTO plagiarism_match (contest_id, question_id, submission_id1, submission_id2, username1, username2, language, similarity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            
            int batchSize = 1000;
            for (int i = 0; i < matchesSaved.size(); i += batchSize) {
                List<PlagiarismMatch> batch = matchesSaved.subList(i, Math.min(i + batchSize, matchesSaved.size()));
                jdbcTemplate.batchUpdate(sql, new org.springframework.jdbc.core.BatchPreparedStatementSetter() {
                    @Override
                    public void setValues(java.sql.PreparedStatement ps, int j) throws java.sql.SQLException {
                        PlagiarismMatch match = batch.get(j);
                        ps.setString(1, match.getContestId());
                        ps.setInt(2, match.getQuestionId());
                        ps.setString(3, match.getSubmissionId1());
                        ps.setString(4, match.getSubmissionId2());
                        ps.setString(5, match.getUsername1());
                        ps.setString(6, match.getUsername2());
                        ps.setString(7, match.getLanguage());
                        ps.setDouble(8, match.getSimilarity());
                    }

                    @Override
                    public int getBatchSize() {
                        return batch.size();
                    }
                });
            }
        }

        return matchesSaved;
    }

    public List<PlagiarismMatch> getMatchesForSubmission(String submissionId) {
        return plagiarismMatchRepository.findBySubmissionId1OrSubmissionId2(submissionId, submissionId);
    }

    public String getSubmissionLanguage(String submissionId) {
        return submissionRepository.findById(submissionId)
                .map(Submission::getLanguage)
                .orElse("unknown");
    }

    private String stripExtension(String filename) {
        int dotIdx = filename.lastIndexOf('.');
        return (dotIdx == -1) ? filename : filename.substring(0, dotIdx);
    }

    private String normalizeCode(String code) {
        if (code == null) return "";
        StringBuilder sb = new StringBuilder();
        String[] lines = code.split("\n");
        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.isEmpty()) continue;
            
            // Skip imports/includes/using/package
            if (trimmed.startsWith("#include") || trimmed.startsWith("import ") || 
                trimmed.startsWith("from ") || trimmed.startsWith("using ") || 
                trimmed.startsWith("package ") || trimmed.startsWith("#define")) {
                continue;
            }
            
            // Skip simple boilerplate
            if (trimmed.startsWith("public class ") || trimmed.contains("int main") || 
                trimmed.contains("if __name__") || trimmed.contains("def main") || 
                trimmed.matches("return\\s+0;?")) {
                continue;
            }
            
            // Strip comments
            String s = line;
            s = s.replaceAll("//.*$", "");
            s = s.replaceAll("/\\*[\\s\\S]*?\\*/", "");
            s = s.replaceAll("#.*$", "");
            
            // Remove trailing semicolons
            s = s.replaceAll(";+\\s*$", "");
            
            // Remove type declarations
            s = s.replaceAll("\\b(int|long\\s+long|long|double|float|string|bool|boolean|char|auto|var|let|const|void|unsigned|signed|size_t|uint64_t|int64_t|int32_t)\\b", "");
            s = s.replaceAll("\\bvector\\s*<[^>]*>", "");
            s = s.replaceAll("\\barray\\s*<[^>]*>", "");
            s = s.replaceAll("\\bmap\\s*<[^>]*>", "");
            s = s.replaceAll("\\bset\\s*<[^>]*>", "");
            s = s.replaceAll("\\bpair\\s*<[^>]*>", "");
            s = s.replaceAll("\\bList\\s*<[^>]*>", "");
            s = s.replaceAll("\\bMap\\s*<[^>]*>", "");
            s = s.replaceAll("\\bSet\\s*<[^>]*>", "");
            
            // Normalize print
            s = s.replaceAll("\\bcout\\s*<<\\s*", "print(");
            s = s.replaceAll("\\bSystem\\.out\\.println?\\s*\\(", "print(");
            s = s.replaceAll("\\bprintf\\s*\\(", "print(");
            s = s.replaceAll("\\bconsole\\.log\\s*\\(", "print(");
            
            // Normalize input
            s = s.replaceAll("\\bcin\\s*>>\\s*", "input(");
            s = s.replaceAll("\\bscanner\\.\\w+\\s*\\(\\s*\\)", "input()");
            
            // Remove keywords
            s = s.replaceAll("\\b(endl|std::|self\\.|this\\.|this->|new |public |private |protected |static |final |virtual |override |inline )", "");
            s = s.replaceAll("\\b(def |fn |func |function )", "");
            
            // Normalize for-loops
            s = s.replaceAll("for\\s*\\(\\s*\\w*\\s*=\\s*(\\w+)\\s*;\\s*\\w+\\s*[<>]=?\\s*(\\w+)\\s*;\\s*\\w+\\+\\+\\s*\\)", "for($1,$2)");
            s = s.replaceAll("for\\s+\\w+\\s+in\\s+range\\s*\\(\\s*(\\w+)\\s*,?\\s*(\\w*)\\s*\\)", "for($1,$2)");
            
            // Remove braces
            s = s.replaceAll("[{}]", "");
            
            // Normalize operators
            s = s.replaceAll("\\band\\b", "&&");
            s = s.replaceAll("\\bor\\b", "||");
            s = s.replaceAll("\\bnot\\b", "!");
            
            // Normalize size/len
            s = s.replaceAll("\\blen\\s*\\(", "size(");
            s = s.replaceAll("\\.size\\s*\\(\\s*\\)", ".size()");
            s = s.replaceAll("\\.length\\b", ".size()");
            
            // Normalize append/push_back
            s = s.replaceAll("\\.push_back\\s*\\(", ".add(");
            s = s.replaceAll("\\.append\\s*\\(", ".add(");
            s = s.replaceAll("\\.emplace_back\\s*\\(", ".add(");
            
            // Remove colons at end
            s = s.replaceAll(":\\s*$", "");
            
            // Collapse whitespace
            s = s.replaceAll("\\s+", "");
            
            if (!s.isEmpty()) {
                sb.append(s).append("\n");
            }
        }
        return sb.toString();
    }

    private void deleteDirectoryRecursively(File file) {
        File[] contents = file.listFiles();
        if (contents != null) {
            for (File f : contents) {
                deleteDirectoryRecursively(f);
            }
        }
        file.delete();
    }
}
