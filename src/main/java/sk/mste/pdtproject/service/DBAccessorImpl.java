package sk.mste.pdtproject.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import sk.mste.pdtproject.enumerator.QueryType;
import sk.mste.pdtproject.factory.PSSetterFactory;
import sk.mste.pdtproject.factory.RSExtractorFactory;
import sk.mste.pdtproject.model.PDTFilter;

@Slf4j
@Component
public class DBAccessorImpl implements DBAccessor {
    private JdbcTemplate jdbcTemplate;
    private RSExtractorFactory rsExtractorFactory;
    private PSSetterFactory psSetterFactory;

    @Autowired
    public DBAccessorImpl(JdbcTemplate jdbcTemplate,
                          RSExtractorFactory rsExtractorFactory,
                          PSSetterFactory psSetterFactory) {

        this.jdbcTemplate = jdbcTemplate;
        this.rsExtractorFactory = rsExtractorFactory;
        this.psSetterFactory = psSetterFactory;
    }

    @Override
    public String queryData(PDTFilter PDTFilter, QueryType queryType, String queryTemplate) {
        return jdbcTemplate.query(
                queryTemplate,
                this.psSetterFactory.createPSSetter(PDTFilter, queryType),
                this.rsExtractorFactory.createExtractor(queryType));
    }


    @Override
    public String queryData(QueryType queryType, String queryTemplate) {
        return jdbcTemplate.query(
                queryTemplate,
                this.rsExtractorFactory.createExtractor(queryType)
        );
    }
}
