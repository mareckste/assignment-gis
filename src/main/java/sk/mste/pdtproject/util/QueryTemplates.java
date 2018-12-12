package sk.mste.pdtproject.util;

public final class QueryTemplates {

    public static final String QUERY_INSTITUTIONS = new StringBuilder()
            .append("select")
            .append("    p.name,")
            .append("    p.amenity,")
            .append("    st_asgeojson(ST_Transform(p.way, 4326)),")
            .append("    round(")
            .append("            cast(ST_Distance(ST_MakePoint(?, ?)::geography," )
            .append("            ST_Transform(p.way, 4326)::geography) as numeric),")
            .append("            0")
            .append("          ) as distance")
            .append("  from planet_osm_point p")
            .append("  where 1=1 ")
            .append("    and p.amenity = ANY (?) ")
            .append("    and ST_DWithin((ST_MakePoint(?, ?))::geography, ST_Transform(p.way, 4326)::geography, ?)")
            .append("  order by distance limit ?")
            .toString();

    public static final String QUERY_FIRES = new StringBuilder()
            .append(" select")
            .append("     (VALUES ('Fire')) as title, (VALUES ('SF')) as city,")
            .append("     st_asgeojson(ST_Transform(way,4326))")
            .append(" from fires")
            .append(" limit 1200")
            .toString();

    public static final String QUERY_SAFE_LIBS = new StringBuilder()
    .append("  with libraries as (")
    .append("      select *, ")
    .append("         st_asgeojson(ST_Transform(p.way, 4326)),")
    .append("         round(")
    .append("            cast(ST_Distance(ST_MakePoint(?, ?)::geography,")
    .append("                             ST_Transform(p.way, 4326)::geography) as numeric),")
    .append("                             0")
    .append("         ) as distance")
    .append("       from planet_osm_point p")
    .append("       where 1=1")
    .append("           and p.amenity ='library'")
    .append("           order by distance limit 10")
    .append("           )")
    .append("       select l.name, ")
    .append("              (")
    .append("                   select count(*) ")
    .append("                   from fires f ")
    .append("                   where ")
    .append("                       ST_DWithin(ST_Transform(l.way,4326), ST_Transform(f.way,4326)::geography, 500)) ")
    .append("              as fire_density, ")
    .append("              l.st_asgeojson ")
    .append("       from libraries l")
    .append("       order by fire_density limit 1").toString();

    private QueryTemplates() {}
}
