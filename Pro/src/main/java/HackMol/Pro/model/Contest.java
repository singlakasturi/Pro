package HackMol.Pro.model;


import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Contest {

    @Id
    private String contestId;

    private String title;
    private LocalDateTime startDate;
    private Integer participantCount;

    public void getStartDate() {
    }

    public String getContestId() {
        return contestId;
    }

    public String getTitle() {
        return this.title;
    }

    public LocalDateTime getStartTime() {
        return this.startDate;
    }

    public Integer getParticipantCount() {
        return participantCount;
    }
}
