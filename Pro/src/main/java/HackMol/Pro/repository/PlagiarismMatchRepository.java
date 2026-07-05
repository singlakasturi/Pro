package HackMol.Pro.repository;

import HackMol.Pro.model.PlagiarismMatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlagiarismMatchRepository extends JpaRepository<PlagiarismMatch, Long> {
    List<PlagiarismMatch> findByQuestionId(Integer questionId);
    List<PlagiarismMatch> findBySubmissionId1OrSubmissionId2(String subId1, String subId2);

    @Modifying
    @Query("DELETE FROM PlagiarismMatch p WHERE p.questionId = :questionId")
    void deleteByQuestionId(@Param("questionId") Integer questionId);
}
