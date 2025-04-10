package HackMol.Pro.model;

import com.fasterxml.jackson.annotation.JsonFormat;

@JsonFormat(shape = JsonFormat.Shape.STRING)
public enum Difficulty {
    EASY,
    MEDIUM,
    HARD
}
