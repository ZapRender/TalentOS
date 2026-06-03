package com.rrhh.service;

import com.rrhh.dto.AreaRequest;
import com.rrhh.dto.AreaResponse;
import com.rrhh.exception.DuplicateResourceException;
import com.rrhh.exception.ResourceNotFoundException;
import com.rrhh.model.Area;
import com.rrhh.repository.AreaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AreaService {

    private final AreaRepository areaRepository;

    public List<AreaResponse> getAll() {
        return areaRepository.findAll().stream().map(this::toResponse).toList();
    }

    public List<AreaResponse> getActivas() {
        return areaRepository.findByActivoTrue().stream().map(this::toResponse).toList();
    }

    public AreaResponse getById(Long id) {
        return toResponse(getOrThrow(id));
    }

    @Transactional
    public AreaResponse create(AreaRequest request) {
        String nombre = normalize(request.getNombre());
        if (nombre.isEmpty()) throw new IllegalArgumentException("El nombre del área no puede estar vacío");
        if (areaRepository.existsByNombreIgnoreCase(nombre)) {
            throw new DuplicateResourceException("Ya existe un área con el nombre: " + nombre);
        }
        Area area = Area.builder()
                .nombre(nombre)
                .descripcion(request.getDescripcion())
                .activo(request.getActivo() != null ? request.getActivo() : true)
                .build();
        return toResponse(areaRepository.save(area));
    }

    @Transactional
    public AreaResponse update(Long id, AreaRequest request) {
        Area area = getOrThrow(id);
        String nombre = normalize(request.getNombre());
        if (nombre.isEmpty()) throw new IllegalArgumentException("El nombre del área no puede estar vacío");
        if (!area.getNombre().equalsIgnoreCase(nombre) && areaRepository.existsByNombreIgnoreCase(nombre)) {
            throw new DuplicateResourceException("Ya existe un área con el nombre: " + nombre);
        }
        area.setNombre(nombre);
        if (request.getDescripcion() != null) area.setDescripcion(request.getDescripcion());
        if (request.getActivo() != null)      area.setActivo(request.getActivo());
        return toResponse(areaRepository.save(area));
    }

    @Transactional
    public AreaResponse toggleActivo(Long id) {
        Area area = getOrThrow(id);
        area.setActivo(Boolean.FALSE.equals(area.getActivo()));
        return toResponse(areaRepository.save(area));
    }

    // ── helpers ──────────────────────────────────────────────────

    Area getOrThrow(Long id) {
        return areaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Área no encontrada con id: " + id));
    }

    private String normalize(String v) {
        return v != null ? v.trim() : "";
    }

    private AreaResponse toResponse(Area a) {
        return AreaResponse.builder()
                .id(a.getId())
                .nombre(a.getNombre())
                .descripcion(a.getDescripcion())
                .activo(a.getActivo())
                .creadoEn(a.getCreadoEn())
                .build();
    }
}
