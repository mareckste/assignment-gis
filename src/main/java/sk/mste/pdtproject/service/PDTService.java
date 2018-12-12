package sk.mste.pdtproject.service;

import sk.mste.pdtproject.model.PDTFilter;

public interface PDTService {

    String findAmenities(PDTFilter PDTFilter);

    String findSaveLibraries(PDTFilter PDTFilter);

    String findFires();
}
