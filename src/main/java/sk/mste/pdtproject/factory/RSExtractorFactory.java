package sk.mste.pdtproject.factory;

import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.stereotype.Component;
import sk.mste.pdtproject.enumerator.QueryType;

@Slf4j
@Component
public class RSExtractorFactory {

    public ResultSetExtractor<String> createExtractor(QueryType queryType) {
        return resultSet -> {
            StringBuilder geoJSON = new StringBuilder();

            geoJSON.append("[");
            while (resultSet.next()) {

                String title = queryType == QueryType.FIRES ? "Fires San Francisco" :
                        resultSet.getString(1);

                if (resultSet.getString(1) == null)
                    continue;

                geoJSON.append("{")
                        .append("\"type\": \"Feature\", ")
                        .append("\"geometry\": ").append(resultSet.getString(3)).append(", ")
                        .append("\"properties\": {")
                        .append("\"title\": \"").append(title).append("\", ")
                        .append("\"icon\": \"harbor\"}},");
            }

            log.info("ge {}", geoJSON.length());
            if (geoJSON.length() > 1)
                geoJSON.deleteCharAt(geoJSON.length() - 1);
            geoJSON.append("]");
            log.info("GeoJSON contents >>>> \n{}\n", geoJSON.toString());

            return geoJSON.toString();
        };
    }


}
