package sk.mste.pdtproject.factory;

import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.PreparedStatementSetter;
import org.springframework.stereotype.Component;
import sk.mste.pdtproject.enumerator.QueryType;
import sk.mste.pdtproject.model.PDTFilter;

import java.sql.Array;

@Slf4j
@Component
public class PSSetterFactory {
    public PreparedStatementSetter createPSSetter(PDTFilter PDTFilter, QueryType queryType) {
        PreparedStatementSetter result = null;

        switch (queryType) {
            case INSTITUTIONS:
                result = preparedStatement -> {
                    Array amenities =
                            preparedStatement.getConnection().
                                    createArrayOf("VARCHAR", PDTFilter.getAmenityTypes());

                    preparedStatement.setDouble(1, PDTFilter.getLon());
                    preparedStatement.setDouble(2, PDTFilter.getLat());

                    preparedStatement.setArray(3, amenities);

                    preparedStatement.setDouble(4, PDTFilter.getLon());
                    preparedStatement.setDouble(5, PDTFilter.getLat());

                    preparedStatement.setInt(6, PDTFilter.getMaxRadius());
                    preparedStatement.setInt(7, PDTFilter.getMaxResults());
                }; break;

            case SAFE_LIBRARIES:
                result = preparedStatement -> {
                    preparedStatement.setDouble(1, PDTFilter.getLon());
                    preparedStatement.setDouble(2, PDTFilter.getLat());
                }; break;
        }

        return result;
    }
}
