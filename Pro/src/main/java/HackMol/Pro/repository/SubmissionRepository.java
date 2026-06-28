package HackMol.Pro.repository;

import HackMol.Pro.model.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, String> {
    List<Submission> findByQuestionId(Integer questionId);
    Optional<Submission> findByQuestionIdAndUsername(Integer questionId, String username);
}
