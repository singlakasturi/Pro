package HackMol.Pro;

import HackMol.Pro.model.*;
import HackMol.Pro.repository.*;
import HackMol.Pro.services.PlagiarismService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class PlagiarismServiceTest {

    @Autowired
    private PlagiarismService plagiarismService;

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private CodeRepository codeRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private ContestRepository contestRepository;

    @Test
    void testPlagiarismCheck() {
        // 1. Create a dummy contest
        Contest contest = new Contest();
        contest.setContestId("test-contest");
        contest.setTitle("Test Contest");
        contest.setStartDate(LocalDateTime.now());
        contest.setParticipantCount(10);
        contestRepository.save(contest);

        // 2. Create a dummy question
        Question question = new Question();
        question.setQuestionId(9999);
        question.setContest(contest);
        question.setQuestionNumber(1);
        question.setTitle("Test Question");
        question.setPoint(5);
        question.setDifficulty(Difficulty.EASY);
        question.setTotalSubmissions(0);
        question.setTotalAccepted(0);
        question.setUsersAccepted(0);
        questionRepository.save(question);

        // 3. Create two user submissions with very similar Java code
        Submission sub1 = new Submission("sub-1", "user-1", 9999, "java", LocalDateTime.now());
        Submission sub2 = new Submission("sub-2", "user-2", 9999, "java", LocalDateTime.now());
        submissionRepository.save(sub1);
        submissionRepository.save(sub2);

        String code1 = "public class Solution {\n" +
                       "    public int add(int a, int b) {\n" +
                       "        int sum = a + b;\n" +
                       "        System.out.println(\"Sum is: \" + sum);\n" +
                       "        if (sum > 10) {\n" +
                       "            System.out.println(\"Sum is greater than 10\");\n" +
                       "        } else {\n" +
                       "            System.out.println(\"Sum is less than or equal to 10\");\n" +
                       "        }\n" +
                       "        return sum;\n" +
                       "    }\n" +
                       "}";
                       
        String code2 = "public class Solution {\n" +
                       "    public int add(int a, int b) {\n" +
                       "        int sum = a + b;\n" +
                       "        System.out.println(\"Sum is: \" + sum);\n" +
                       "        if (sum > 10) {\n" +
                       "            System.out.println(\"Sum is greater than 10\");\n" +
                       "        } else {\n" +
                       "            System.out.println(\"Sum is less than or equal to 10\");\n" +
                       "        }\n" +
                       "        return sum;\n" +
                       "    }\n" +
                       "}";

        codeRepository.save(new Code("sub-1", code1));
        codeRepository.save(new Code("sub-2", code2));

        // 4. Run the plagiarism check
        List<PlagiarismMatch> matches = plagiarismService.runPlagiarismCheck(9999);

        // 5. Assertions
        assertNotNull(matches);
        assertFalse(matches.isEmpty());
        
        PlagiarismMatch match = matches.get(0);
        assertEquals("test-contest", match.getContestId());
        assertEquals(9999, match.getQuestionId());
        assertTrue(match.getSimilarity() > 80.0);
        
        // Test fetching matches by submission id
        List<PlagiarismMatch> subMatches = plagiarismService.getMatchesForSubmission("sub-1");
        assertFalse(subMatches.isEmpty());
    }

    @Test
    void testCrossLanguagePlagiarismCheck() {
        // 1. Fetch or create a contest
        Contest contest = contestRepository.findById("test-contest").orElseGet(() -> {
            Contest c = new Contest();
            c.setContestId("test-contest");
            c.setTitle("Test Contest");
            c.setStartDate(LocalDateTime.now());
            c.setParticipantCount(10);
            return contestRepository.save(c);
        });

        // 2. Create a dummy question
        Question question = new Question();
        question.setQuestionId(8888);
        question.setContest(contest);
        question.setQuestionNumber(2);
        question.setTitle("Test Question 2");
        question.setPoint(5);
        question.setDifficulty(Difficulty.MEDIUM);
        question.setTotalSubmissions(0);
        question.setTotalAccepted(0);
        question.setUsersAccepted(0);
        questionRepository.save(question);

        // 3. Create two user submissions with different languages but similar code logic
        Submission sub3 = new Submission("sub-3", "user-3", 8888, "cpp", LocalDateTime.now());
        Submission sub4 = new Submission("sub-4", "user-4", 8888, "python3", LocalDateTime.now());
        submissionRepository.save(sub3);
        submissionRepository.save(sub4);

        // C++ code (represented with similar syntax to pass text threshold)
        String code3 = "// Bubble sort implementation\n" +
                       "// This sorts the array of elements\n" +
                       "int main() {\n" +
                       "    arr = [64, 34, 25, 12, 22, 11, 90];\n" +
                       "    n = len(arr);\n" +
                       "    for i in range(n - 1) {\n" +
                       "        for j in range(n - i - 1) {\n" +
                       "            if (arr[j] > arr[j + 1]) {\n" +
                       "                temp = arr[j];\n" +
                       "                arr[j] = arr[j + 1];\n" +
                       "                arr[j + 1] = temp;\n" +
                       "            }\n" +
                       "        }\n" +
                       "    }\n" +
                       "}";

        // Python code (very similar logic and layout)
        String code4 = "# Bubble sort implementation\n" +
                       "# This sorts the array of elements\n" +
                       "arr = [64, 34, 25, 12, 22, 11, 90]\n" +
                       "n = len(arr)\n" +
                       "for i in range(n - 1):\n" +
                       "    for j in range(n - i - 1):\n" +
                       "        if arr[j] > arr[j + 1]:\n" +
                       "            temp = arr[j]\n" +
                       "            arr[j] = arr[j + 1]\n" +
                       "            arr[j + 1] = temp\n";

        codeRepository.save(new Code("sub-3", code3));
        codeRepository.save(new Code("sub-4", code4));

        // 4. Run plagiarism check
        List<PlagiarismMatch> matches = plagiarismService.runPlagiarismCheck(8888);

        // 5. Assertions
        assertNotNull(matches);
        assertFalse(matches.isEmpty());

        PlagiarismMatch match = matches.get(0);
        assertEquals("test-contest", match.getContestId());
        assertEquals(8888, match.getQuestionId());
        assertEquals("all", match.getLanguage());
        assertTrue(match.getSimilarity() > 50.0);

        // Test fetching dynamic languages
        assertEquals("cpp", plagiarismService.getSubmissionLanguage("sub-3"));
        assertEquals("python3", plagiarismService.getSubmissionLanguage("sub-4"));
    }
}
