package sk.mste.pdtproject.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@EqualsAndHashCode
@AllArgsConstructor
@NoArgsConstructor
public class PDTFilter {

    private Double lon;
    private Double lat;
    private int maxRadius;
    private String[] amenityTypes;
    private int maxResults;

}
