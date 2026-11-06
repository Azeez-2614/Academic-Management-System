package com.studentmanager.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.junit.jupiter.api.Assertions.assertEquals;

class MarkEntityTest {

    @ParameterizedTest(name = "Obtained {0}/{1} ({2}%) should yield Grade {3}")
    @CsvSource({
            "100.0, 100.0, 100.0, A+",
            "90.0, 100.0, 90.0, A+",
            "89.99, 100.0, 89.99, A",
            "85.0, 100.0, 85.0, A",
            "80.0, 100.0, 80.0, A",
            "79.99, 100.0, 79.99, B+",
            "75.0, 100.0, 75.0, B+",
            "70.0, 100.0, 70.0, B+",
            "69.99, 100.0, 69.99, B",
            "60.0, 100.0, 60.0, B",
            "59.99, 100.0, 59.99, C",
            "50.0, 100.0, 50.0, C",
            "49.99, 100.0, 49.99, D",
            "40.0, 100.0, 40.0, D",
            "39.99, 100.0, 39.99, F",
            "0.0, 100.0, 0.0, F"
    })
    @DisplayName("Verify grading boundaries match institutional grading policy")
    void testGradingBoundaries(double obtained, double total, double expectedPct, String expectedGrade) {
        Mark mark = new Mark();
        mark.setMarks(obtained);
        mark.setTotalMarks(total);

        assertEquals(expectedPct, mark.getPercentage(), 0.01, "Percentage calculation mismatch");
        assertEquals(expectedGrade, mark.getGrade(), "Grade calculation mismatch");
    }

    @Test
    @DisplayName("Zero or null total marks returns 0.0 percentage and F grade")
    void testZeroTotalMarks() {
        Mark mark = new Mark();
        mark.setMarks(50.0);
        mark.setTotalMarks(0.0);

        assertEquals(0.0, mark.getPercentage());
        assertEquals("F", mark.getGrade());
    }

}
