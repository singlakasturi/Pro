package HackMol.Pro.repository;

import HackMol.Pro.model.Contest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import java.util.List;

@Repository
public interface ContestRepository extends JpaRepository<Contest, String> {
    List<Contest> findAllByOrderByStartDateDesc();

    @Query("SELECT c.contestId FROM Contest c")
    List<String> findAllContestIds();
}
