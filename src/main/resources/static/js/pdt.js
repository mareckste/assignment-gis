$(document).ready(function () {

    // model --> holds data selected by user
    var modelController = (function () {

        var FilterEdu = function (lon, lat, amenities, max_dist, max_results) {
            this.lon = lon;
            this.lat = lat;
            this.amenityTypes = amenities;
            this.maxRadius = max_dist;
            this.maxResults = max_results;
        };

        return {
            createFilter: function (inputData) {
                return new FilterEdu(
                    inputData.lng,
                    inputData.lat,
                    inputData.amenities,
                    inputData.max_dist,
                    inputData.max_result
                );
            }
        }

    })();


    // view --> responsible for DOM manipulation
    var viewController = (function () {

        var DOM_STRINGS = {
            fr_school_cb: '#cbschool',
            fr_library_cb: '#cblibrary',
            it_max_results: '#it_max',
            it_max_dist: '#it_maxdist',
            btn_search: '#btn_search',
            btn_heatmap: '#btn_heatmap',
            amenity_checkboxes: '.amecb',
            scroll_bar: '.pdt-scroll',
            amenity_types: ['school', 'college', 'university']
        };

        var createMap = function () {
            var tokenKey = 'pk.eyJ1IjoibWVyZXRoIiwiYSI6ImNqbXA3Z2ZoNzB4YzIzeHFjb3VwdXJuN2oifQ.LlSXvjk8lCZDBl6OYq0xdA';
            mapboxgl.accessToken = tokenKey;

            return new mapboxgl.Map({
                container: 'map',
                style: 'mapbox://styles/mapbox/streets-v9',
                center: [-122.4494, 37.7588],
                zoom: 12
            });
        };

        var createMarker = function () {
            return new mapboxgl.Marker({draggable: true})
                .setLngLat([-122.4494, 37.7588]);
        };

        var map = undefined;
        var marker = undefined;

        var checkedAmenities = function () {
            return $(DOM_STRINGS.amenity_checkboxes).map(function (index) {
                if (this.checked) {
                    return DOM_STRINGS.amenity_types[index];
                }
            }).get();
        };

        var focusMapOnInstitution = function (coordinates) {
            map.flyTo({
                center: coordinates,
                zoom: 17
            });
        };

        var setInstitutionsList = function (geoData) {
            // clear data
            $(DOM_STRINGS.scroll_bar).empty();

            // load new data
            for (var i = 0; i < geoData.length; i++) {
                current_coordinates = geoData[i].geometry.coordinates;
                current_inst_name   = geoData[i].properties.title.substring(0, 20) + '...';

                row = $('<div class="row mb-3">');
                col_btn = $('<div class="col-3 d-flex align-items-stretch">');
                col_link = $('<div class="col-7 d-flex align-items-stretch">');

                link = $('<a class="nav-link">');
                link.data('coordinates', current_coordinates);
                link.text(current_inst_name);
                link.attr('href', '#');

                btn = $('<button type="button" class="btn btn-outline-success">Find Safe Library</button>');
                btn.data('coordinates', current_coordinates);

                $(DOM_STRINGS.scroll_bar).append(row.append(
                    col_link.append($('<li class="nav-item">').append(link)), col_btn.append(btn)));
            }
        };

        var addMapDataSource = function (sourceId, data) {

            if (map.getSource(sourceId) !== undefined)
                map.removeSource(sourceId);

            map.addSource(sourceId, {
                "type": "geojson",
                "data": {
                    "type": "FeatureCollection",
                    "features": data
                }
            });
        };

        var addMapDataLayer = function (layerId, sourceId, type, data, icon) {

            if (type === 'heatmap') {

                var heatId  = layerId + '-heat';
                var pointId = layerId + '-point';

                if (map.getLayer(heatId) !== undefined)
                    map.removeLayer(heatId);

                if (map.getLayer(pointId) !== undefined)
                    map.removeLayer(pointId);

                addMapDataSource(sourceId, data);

                map.addLayer({
                    id: heatId,
                    type: type,
                    source: sourceId,
                    maxzoom: 15,
                    paint: {
                        // increase weight as diameter breast height increases
                        'heatmap-weight': {
                            property: 'dbh',
                            type: 'exponential',
                            stops: [
                                [1, 0],
                                [62, 1]
                            ]
                        },
                        // increase intensity as zoom level increases
                        'heatmap-intensity': {
                            stops: [
                                [11, 1],
                                [15, 3]
                            ]
                        },
                        // assign color values be applied to points depending on their density
                        'heatmap-color':
                            [
                                'interpolate',
                                ['linear'],
                                ['heatmap-density'],
                                0, 'rgba(236,222,239,0)',
                                0.2, 'rgb(208,209,230)',
                                0.4, 'rgb(166,189,219)',
                                0.6, 'rgb(103,169,207)',
                                0.8, 'rgb(28,144,153)'
                            ],
                        // increase radius as zoom increases
                        'heatmap-radius': {
                            stops: [
                                [11, 15],
                                [15, 20]
                            ]
                        },
                        // decrease opacity to transition into the circle layer
                        'heatmap-opacity': {
                            default: 1,
                            stops: [
                                [14, 1],
                                [15, 0]
                            ]
                        },
                    }
                }, 'waterway-label');


                map.addLayer({
                    id: pointId,
                    type: 'circle',
                    source: sourceId,
                    minzoom: 14,
                    paint: {
                        // increase the radius of the circle as the zoom level and dbh value increases
                        'circle-radius': {
                            property: 'dbh',
                            type: 'exponential',
                            stops: [
                                [{zoom: 15, value: 1}, 5],
                                [{zoom: 15, value: 62}, 10],
                                [{zoom: 22, value: 1}, 20],
                                [{zoom: 22, value: 62}, 50],
                            ]
                        },
                        'circle-color': {
                            property: 'dbh',
                            type: 'exponential',
                            stops: [
                                [0, 'rgba(236,222,239,0)'],
                                [10, 'rgb(236,222,239)'],
                                [20, 'rgb(208,209,230)'],
                                [30, 'rgb(166,189,219)'],
                                [40, 'rgb(103,169,207)'],
                                [50, 'rgb(28,144,153)'],
                                [60, 'rgb(1,108,89)']
                            ]
                        },
                        'circle-stroke-color': 'white',
                        'circle-stroke-width': 1,
                        'circle-opacity': {
                            stops: [
                                [14, 0],
                                [15, 1]
                            ]
                        }
                    }
                }, 'waterway-label');

            } else {

                if (map.getLayer(layerId) !== undefined)
                    map.removeLayer(layerId);

                addMapDataSource(sourceId, data);

                map.addLayer({
                    "id": layerId,
                    "type": type,
                    "source": sourceId,
                    "layout": {
                        "icon-image": icon,
                        "text-field": "{title}",
                        "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
                        "text-offset": [0, 0.6],
                        "text-anchor": "top"
                    }
                });

            }

        };

        return {
            getInputData: function () {

                return {
                    lng: marker.getLngLat().lng,
                    lat: marker.getLngLat().lat,
                    amenities: checkedAmenities(),
                    max_dist: $(DOM_STRINGS.it_max_dist).val(),
                    max_result: $(DOM_STRINGS.it_max_results).val()
                };

            },

            getLibInputData: function(obj) {
                return {
                    lng: $(obj).data('coordinates')[0],
                    lat: $(obj).data('coordinates')[1],
                    amenities: checkedAmenities(),
                    max_dist: $(DOM_STRINGS.it_max_dist).val(),
                    max_result: $(DOM_STRINGS.it_max_results).val()
                };
            },

            createMap: function () {
                if (map === undefined && marker === undefined) {
                    map = createMap();
                    marker = createMarker();
                    marker.addTo(map);
                }
            },

            getMap: function () {
                return map;
            },

            getMarker: function () {
                return marker;
            },

            getDOMStrings: function () {
                return DOM_STRINGS;
            },

            setMapFocusTo: function (coordinates) {
                focusMapOnInstitution(coordinates);
            },

            setInstitutionsList: function (geoData) {
                setInstitutionsList(geoData)
            },

            addMapLayer: function (layerId, sourceId, type, data, icon) {
                addMapDataLayer(layerId, sourceId, type, data, icon);
            }
        }
    })();


    // controller --> chains model and view
    var pdtController = (function (modelCtrl, viewCtrl) {

        var setupEventListeners = function () {
            var DOM = viewCtrl.getDOMStrings();
            var marker = viewCtrl.getMarker();

            // form
            $(DOM.btn_search).click(searchInstitutions);
            $(DOM.btn_heatmap).click(createFireHeatMap);

            // map
            marker.on('dragend', searchInstitutions);

            // dynamic
            $(DOM.scroll_bar).on('mouseenter', 'li a', toggleActive);
            $(DOM.scroll_bar).on('mouseleave', 'li a', toggleActive);
            $(DOM.scroll_bar).on('click', 'button', safeLibs);
            $(DOM.scroll_bar).on('click', 'li a', function () {
                viewCtrl.setMapFocusTo($(this).data('coordinates'));
            });

        };

        var toggleActive = function () {
            var className = ' ' + this.className + ' ';

            this.className = ~className.indexOf(' active ') ?
                className.replace(' active ', ' ') :
                this.className + ' active';
        };

        var searchInstitutions = function () {
            var map = viewCtrl.getMap();

            // == get data from ui ==
            var inputData = viewCtrl.getInputData();

            // == create model/params ==
            var filter = modelCtrl.createFilter(inputData);

            // == call server and update ui via ajax ==
            ajaxInstitutions(map, filter);
        };

        var createFireHeatMap = function () {
            ajaxFireHeatMap(viewCtrl.getMap());
        };

        var safeLibs = function () {
            var inputData = viewCtrl.getLibInputData($(this));
            var filter = modelCtrl.createFilter(inputData);
            ajaxLibs(map, filter);
        };

        var createMap = function () {
            viewCtrl.createMap();
        };

        var ajaxInstitutions = function (map, filter) {
            $.ajax({
                type: "POST",
                contentType: "application/json",
                dataType: 'json',
                url: "/search",
                data: JSON.stringify(filter),
                success: function (geoData) {
                    viewCtrl.addMapLayer('institutions-map', 'institutions', 'symbol', geoData, "school-15");
                    viewCtrl.setInstitutionsList(geoData);
                }
            });
        };

        var ajaxFireHeatMap = function (map) {
            $.ajax({
                type: "GET",
                contentType: "application/json",
                dataType: 'json',
                url: "/heatmap",
                success: function (geoData) {
                    viewCtrl.addMapLayer('fires-map', 'fires', 'heatmap', geoData, "fire");
                }
            });
        };

        var ajaxLibs = function (map, filter) {
            $.ajax({
                type: "POST",
                contentType: "application/json",
                dataType: 'json',
                url: "/library",
                data: JSON.stringify(filter),
                success: function (geoData) {
                    viewCtrl.addMapLayer('libraries-map', 'libraries', 'symbol', geoData, "library-15");
                    viewCtrl.setMapFocusTo(geoData[0].geometry.coordinates);
                    // viewCtrl.setInstitutionsList(geoData);
                }
            });
        };

        return {
            init: function () {
                createMap();
                setupEventListeners();
            }
        }

    })(modelController, viewController);


    // == init application ==
    pdtController.init();
});

