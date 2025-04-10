package HackMol.Pro.model;


import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
    private LocalDateTime startTime;
    private Integer participantCount;

    public void getStartDate() {
    }
}
