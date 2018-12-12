package sk.mste.pdtproject.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class GeoData {
    private String name;
    private String amenity;
    private Object geoJSON;
    private String distance;
}
