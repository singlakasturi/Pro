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

    @Autowired
    public PlagiarismService(SubmissionRepository submissionRepository,
                             CodeRepository codeRepository,
                             PlagiarismMatchRepository plagiarismMatchRepository,
                             QuestionRepository questionRepository) {
        this.submissionRepository = submissionRepository;
        this.codeRepository = codeRepository;
        this.plagiarismMatchRepository = plagiarismMatchRepository;
        this.questionRepository = questionRepository;
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

        // Group submissions by language (normalized to consolidate dialects/cases)
        Map<String, List<Submission>> languageGroups = submissions.stream()
                .filter(s -> s.getLanguage() != null)
                .collect(Collectors.groupingBy(s -> {
                    String lang = s.getLanguage().toLowerCase().trim();
                    if (lang.equals("c++") || lang.equals("cpp")) {
                        return "cpp";
                    }
                    if (lang.equals("python") || lang.equals("python3")) {
                        return "python3";
                    }
                    return lang;
                }));

        // Delete old matches for this question
        plagiarismMatchRepository.deleteByQuestionId(questionId);

        Set<String> processedPairs = new HashSet<>();

        // 2. Run same-language JPlag comparisons
        for (Map.Entry<String, List<Submission>> entry : languageGroups.entrySet()) {
            String language = entry.getKey();
            List<Submission> groupSubmissions = entry.getValue();

            if (groupSubmissions.size() < 2) {
                continue; // Can't compare less than 2 files
            }

            Path tempDir = null;
            try {
                // Create temporary directory for JPlag comparison
                tempDir = Files.createTempDirectory("jplag-run-" + questionId + "-" + language + "-");

                // Get file extension based on language
                String fileExtension = getExtensionForLanguage(language);

                // Write each submission's code to a file
                for (Submission sub : groupSubmissions) {
                    Optional<Code> codeOpt = codeRepository.findById(sub.getSubmissionId());
                    if (codeOpt.isPresent() && codeOpt.get().getSubmittedCode() != null) {
                        String codeContent = codeOpt.get().getSubmittedCode();
                        // Naming pattern: submissionId.extension
                        Path file = tempDir.resolve(sub.getSubmissionId() + fileExtension);
                        Files.writeString(file, codeContent);
                    }
                }

                // Resolve JPlag Language parser
                de.jplag.Language jplagLanguage = resolveJPlagLanguage(language);

                // Configure and run JPlag
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
                        String rawName1 = comp.firstSubmission().getName();
                        String rawName2 = comp.secondSubmission().getName();

                        // Strip extensions to recover raw submission ID
                        String subId1 = stripExtension(rawName1);
                        String subId2 = stripExtension(rawName2);

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
                                    language,
                                    similarity
                            );
                            matchesSaved.add(match);
                            processedPairs.add(getPairKey(subId1, subId2));
                        }
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
            } finally {
                // Clean up temporary files
                if (tempDir != null) {
                    deleteDirectoryRecursively(tempDir.toFile());
                }
            }
        }

        // 3. Run cross-language plagiarism check using JPlag NaturalLanguage text parser
        if (submissions.size() >= 2) {
            Path tempDirText = null;
            try {
                // Create temporary directory for global JPlag comparison
                tempDirText = Files.createTempDirectory("jplag-global-" + questionId + "-");

                // Write all submissions' code to that directory with a .txt extension
                for (Submission sub : submissions) {
                    Optional<Code> codeOpt = codeRepository.findById(sub.getSubmissionId());
                    if (codeOpt.isPresent() && codeOpt.get().getSubmittedCode() != null) {
                        String codeContent = codeOpt.get().getSubmittedCode();
                        Path file = tempDirText.resolve(sub.getSubmissionId() + ".txt");
                        Files.writeString(file, codeContent);
                    }
                }

                // Run JPlag using NaturalLanguage parser
                de.jplag.Language jplagLanguage = new de.jplag.text.NaturalLanguage();
                JPlagOptions options = new JPlagOptions(
                        jplagLanguage,
                        Set.of(tempDirText.toFile()),
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

                        String pairKey = getPairKey(subId1, subId2);
                        if (processedPairs.contains(pairKey)) {
                            continue; // Skip if already checked via same-language AST parser
                        }

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
                                    "mixed",
                                    similarity
                            );
                            matchesSaved.add(match);
                            processedPairs.add(pairKey);
                        }
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
            } finally {
                if (tempDirText != null) {
                    deleteDirectoryRecursively(tempDirText.toFile());
                }
            }
        }

        // Save all matches in batch to database
        if (!matchesSaved.isEmpty()) {
            plagiarismMatchRepository.saveAll(matchesSaved);
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

    private String getPairKey(String id1, String id2) {
        return id1.compareTo(id2) < 0 ? id1 + "_" + id2 : id2 + "_" + id1;
    }

    private String getExtensionForLanguage(String language) {
        switch (language.toLowerCase()) {
            case "java":
                return ".java";
            case "python":
            case "python3":
                return ".py";
            case "cpp":
            case "c++":
                return ".cpp";
            case "javascript":
            case "js":
                return ".js";
            default:
                return ".txt";
        }
    }

    private String stripExtension(String filename) {
        int dotIdx = filename.lastIndexOf('.');
        return (dotIdx == -1) ? filename : filename.substring(0, dotIdx);
    }

    private de.jplag.Language resolveJPlagLanguage(String language) {
        try {
            switch (language.toLowerCase()) {
                case "java":
                    return new de.jplag.java.JavaLanguage();
                case "python":
                case "python3":
                    return new de.jplag.python3.PythonLanguage();
                case "cpp":
                case "c++":
                    return new de.jplag.cpp.CPPLanguage();
                case "javascript":
                case "js":
                    return new de.jplag.javascript.JavaScriptLanguage();
                default:
                    return new de.jplag.text.NaturalLanguage();
            }
        } catch (Throwable t) {
            // Fallback to text parser if dependency is not present on classpath or reflection failed
            return new de.jplag.text.NaturalLanguage();
        }
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
