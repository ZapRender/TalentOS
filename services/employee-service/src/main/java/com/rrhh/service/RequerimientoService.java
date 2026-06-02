package com.rrhh.service;

import com.rrhh.dto.RequerimientoRequest;
import com.rrhh.dto.RequerimientoResponse;
import com.rrhh.exception.ResourceNotFoundException;
import com.rrhh.model.RequerimientoPersonal;
import com.rrhh.repository.RequerimientoPersonalRepository;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RequerimientoService {

    private static final List<String> ESTADOS = List.of(
            "abierto", "en_proceso", "cubierto", "cancelado");

    private final RequerimientoPersonalRepository requerimientoRepository;
    private final Validator validator;

    /** Lista requerimientos, con filtro opcional por estado. */
    public List<RequerimientoResponse> findAll(String estado) {
        List<RequerimientoPersonal> lista = estado == null || estado.isBlank()
                ? requerimientoRepository.findAll()
                : requerimientoRepository.findByEstado(estado.trim());
        return lista.stream().map(this::toResponse).toList();
    }

    /** Detalle de un requerimiento. */
    public RequerimientoResponse findById(Long id) {
        return toResponse(getOrThrow(id));
    }

    /** Crea un nuevo requerimiento de personal. */
    @Transactional
    public RequerimientoResponse create(RequerimientoRequest request) {
        request.normalize();
        validate(request);
        RequerimientoPersonal req = RequerimientoPersonal.builder()
                .cargo(request.getCargo())
                .perfilRequerido(request.getPerfilRequerido())
                .numeroVacantes(request.getNumeroVacantes())
                .solicitanteId(request.getSolicitanteId())
                .build();
        return toResponse(requerimientoRepository.save(req));
    }

    /** Actualiza cargo, perfil o número de vacantes. Solo si está abierto o en_proceso. */
    @Transactional
    public RequerimientoResponse update(Long id, RequerimientoRequest request) {
        request.normalize();
        validate(request);
        RequerimientoPersonal req = getOrThrow(id);
        if ("cubierto".equals(req.getEstado()) || "cancelado".equals(req.getEstado())) {
            throw new IllegalStateException(
                    "No se puede editar un requerimiento con estado: " + req.getEstado());
        }
        req.setCargo(request.getCargo());
        req.setPerfilRequerido(request.getPerfilRequerido());
        req.setNumeroVacantes(request.getNumeroVacantes());
        req.setSolicitanteId(request.getSolicitanteId());
        return toResponse(requerimientoRepository.save(req));
    }

    /**
     * Cambia el estado del requerimiento.
     * Body esperado: { "estado": "en_proceso" }
     */
    @Transactional
    public RequerimientoResponse cambiarEstado(Long id, String nuevoEstado) {
        if (!ESTADOS.contains(nuevoEstado)) {
            throw new IllegalArgumentException(
                    "Estado inválido: '" + nuevoEstado + "'. Permitidos: " + ESTADOS);
        }
        RequerimientoPersonal req = getOrThrow(id);
        req.setEstado(nuevoEstado);
        return toResponse(requerimientoRepository.save(req));
    }

    // ── helpers ──────────────────────────────────────────────────

    private RequerimientoPersonal getOrThrow(Long id) {
        return requerimientoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Requerimiento no encontrado con id: " + id));
    }

    private void validate(RequerimientoRequest request) {
        Set<ConstraintViolation<RequerimientoRequest>> violations = validator.validate(request);
        if (!violations.isEmpty()) {
            throw new ConstraintViolationException(violations);
        }
    }

    private RequerimientoResponse toResponse(RequerimientoPersonal r) {
        return RequerimientoResponse.builder()
                .id(r.getId())
                .cargo(r.getCargo())
                .perfilRequerido(r.getPerfilRequerido())
                .numeroVacantes(r.getNumeroVacantes())
                .fechaSolicitud(r.getFechaSolicitud())
                .solicitanteId(r.getSolicitanteId())
                .estado(r.getEstado())
                .creadoEn(r.getCreadoEn())
                .build();
    }
}
