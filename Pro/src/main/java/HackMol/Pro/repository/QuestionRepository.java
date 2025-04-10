package HackMol.Pro.repository;

import HackMol.Pro.model.Contest;
import HackMol.Pro.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Integer> {
    List<Question> findByContest(Contest contest);
    List<Question> findByContestContestId(String contestId);
}
