package com.rrhh.service;

import com.rrhh.dto.CandidatoRequest;
import com.rrhh.dto.CandidatoResponse;
import com.rrhh.dto.EmployeeRequest;
import com.rrhh.dto.EmployeeResponse;
import com.rrhh.exception.DuplicateResourceException;
import com.rrhh.exception.ResourceNotFoundException;
import com.rrhh.model.Candidato;
import com.rrhh.repository.CandidatoRepository;
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
public class CandidatoService {

    // Etapas válidas en orden del proceso de selección
    private static final List<String> ETAPAS = List.of(
            "preseleccion",
            "entrevista_inicial",
            "entrevista_gerencia",
            "pruebas",
            "referencias",
            "antecedentes",
            "admision",
            "contratado",
            "rechazado"
    );

    private final CandidatoRepository candidatoRepository;
    private final EmployeeService employeeService;
    private final Validator validator;

    /** Lista todos los candidatos, opcionalmente filtrando por etapa. */
    public List<CandidatoResponse> findAll(String etapa) {
        List<Candidato> lista = etapa == null || etapa.isBlank()
                ? candidatoRepository.findAll()
                : candidatoRepository.findByEtapaActual(etapa.trim());
        return lista.stream().map(this::toResponse).toList();
    }

    /** Detalle de un candidato. */
    public CandidatoResponse findById(Long id) {
        return toResponse(getOrThrow(id));
    }

    /** Registra un nuevo candidato. */
    @Transactional
    public CandidatoResponse create(CandidatoRequest request) {
        request.normalize();
        validate(request);
        Candidato candidato = Candidato.builder()
                .cedula(request.getCedula())
                .nombres(request.getNombres())
                .apellidos(request.getApellidos())
                .email(request.getEmail())
                .telefono(request.getTelefono())
                .cargoAplicado(request.getCargoAplicado())
                .requerimientoId(request.getRequerimientoId())
                .tipoIngresoDefinido(request.getTipoIngresoDefinido())
                .empresaTemporal(request.getEmpresaTemporal())
                .observaciones(request.getObservaciones())
                .build();
        return toResponse(candidatoRepository.save(candidato));
    }

    /**
     * Avanza (o retrocede) la etapa del candidato.
     * También permite marcar como "rechazado" en cualquier punto.
     */
    @Transactional
    public CandidatoResponse actualizarEtapa(Long id, String nuevaEtapa, String observaciones) {
        if (!ETAPAS.contains(nuevaEtapa)) {
            throw new IllegalArgumentException(
                    "Etapa inválida: '" + nuevaEtapa + "'. Valores permitidos: " + ETAPAS);
        }
        Candidato candidato = getOrThrow(id);
        if ("contratado".equals(candidato.getEtapaActual())) {
            throw new IllegalStateException("El candidato ya fue contratado y no puede cambiar de etapa.");
        }
        candidato.setEtapaActual(nuevaEtapa);
        if (observaciones != null && !observaciones.isBlank()) {
            candidato.setObservaciones(observaciones.trim());
        }
        return toResponse(candidatoRepository.save(candidato));
    }

    /**
     * Convierte un candidato en empleado.
     * El candidato debe estar en etapa "admision" para poder contratarse.
     * Crea el empleado y marca el candidato como "contratado".
     */
    @Transactional
    public EmployeeResponse contratar(Long id, EmployeeRequest employeeRequest) {
        Candidato candidato = getOrThrow(id);

        if (!"admision".equals(candidato.getEtapaActual())) {
            throw new IllegalStateException(
                    "El candidato debe estar en etapa 'admision' para ser contratado. " +
                    "Etapa actual: " + candidato.getEtapaActual());
        }

        // Verificar que los datos del candidato coincidan
        if (!candidato.getCedula().equals(employeeRequest.getCedula())) {
            throw new IllegalArgumentException(
                    "La cédula del empleado no coincide con la del candidato.");
        }

        // Crear el empleado usando el EmployeeService existente
        EmployeeResponse empleadoCreado = employeeService.create(employeeRequest);

        // Marcar candidato como contratado
        candidato.setEtapaActual("contratado");
        candidatoRepository.save(candidato);

        return empleadoCreado;
    }

    // ── helpers ──────────────────────────────────────────────────

    private Candidato getOrThrow(Long id) {
        return candidatoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidato no encontrado con id: " + id));
    }

    private void validate(CandidatoRequest request) {
        Set<ConstraintViolation<CandidatoRequest>> violations = validator.validate(request);
        if (!violations.isEmpty()) {
            throw new ConstraintViolationException(violations);
        }
    }

    private CandidatoResponse toResponse(Candidato c) {
        return CandidatoResponse.builder()
                .id(c.getId())
                .cedula(c.getCedula())
                .nombres(c.getNombres())
                .apellidos(c.getApellidos())
                .email(c.getEmail())
                .telefono(c.getTelefono())
                .cargoAplicado(c.getCargoAplicado())
                .requerimientoId(c.getRequerimientoId())
                .etapaActual(c.getEtapaActual())
                .tipoIngresoDefinido(c.getTipoIngresoDefinido())
                .empresaTemporal(c.getEmpresaTemporal())
                .resultadoExamenMed(c.getResultadoExamenMed())
                .observaciones(c.getObservaciones())
                .fechaRegistro(c.getFechaRegistro())
                .creadoEn(c.getCreadoEn())
                .build();
    }
}
