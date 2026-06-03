package com.rrhh.service;

import com.rrhh.dto.EmployeeRequest;
import com.rrhh.dto.EmployeeResponse;
import com.rrhh.exception.DuplicateResourceException;
import com.rrhh.exception.ResourceNotFoundException;
import com.rrhh.model.Area;
import com.rrhh.model.Employee;
import com.rrhh.repository.AreaRepository;
import com.rrhh.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final AreaRepository     areaRepository;

    public List<EmployeeResponse> findAll(String estado) {
        List<Employee> lista = (estado == null || estado.isBlank())
                ? employeeRepository.findAll()
                : employeeRepository.findByEstado(estado.trim());
        return lista.stream().map(this::toResponse).toList();
    }

    public EmployeeResponse findById(Long id) {
        return toResponse(getOrThrow(id));
    }

    @Transactional
    public EmployeeResponse create(EmployeeRequest request) {
        request.normalize();
        if (employeeRepository.existsByCedula(request.getCedula())) {
            throw new DuplicateResourceException(
                    "Ya existe un empleado con cédula: " + request.getCedula());
        }
        Area area = resolveArea(request.getAreaId());
        Employee emp = Employee.builder()
                .cedula(request.getCedula())
                .nombres(request.getNombres())
                .apellidos(request.getApellidos())
                .email(request.getEmail())
                .telefono(request.getTelefono())
                .cargo(request.getCargo())
                .seccion(resolveSeccion(request.getSeccion(), area))
                .area(area)
                .ciudad(request.getCiudad())
                .tipoContrato(request.getTipoContrato())
                .tipoPago(request.getTipoPago())
                .salarioBasico(request.getSalarioBasico())
                .fechaIngreso(request.getFechaIngreso())
                .fechaFinContrato(request.getFechaFinContrato())
                .build();
        return toResponse(employeeRepository.save(emp));
    }

    @Transactional
    public EmployeeResponse update(Long id, EmployeeRequest request) {
        request.normalize();
        Employee emp = getOrThrow(id);
        if (!emp.getCedula().equals(request.getCedula())
                && employeeRepository.existsByCedula(request.getCedula())) {
            throw new DuplicateResourceException(
                    "Ya existe un empleado con cédula: " + request.getCedula());
        }
        Area area = resolveArea(request.getAreaId());
        emp.setCedula(request.getCedula());
        emp.setNombres(request.getNombres());
        emp.setApellidos(request.getApellidos());
        emp.setEmail(request.getEmail());
        emp.setTelefono(request.getTelefono());
        emp.setCargo(request.getCargo());
        emp.setSeccion(resolveSeccion(request.getSeccion(), area));
        emp.setArea(area);
        emp.setCiudad(request.getCiudad());
        emp.setTipoContrato(request.getTipoContrato());
        emp.setTipoPago(request.getTipoPago());
        emp.setSalarioBasico(request.getSalarioBasico());
        emp.setFechaIngreso(request.getFechaIngreso());
        emp.setFechaFinContrato(request.getFechaFinContrato());
        return toResponse(employeeRepository.save(emp));
    }

    @Transactional
    public EmployeeResponse updateEstado(Long id, String nuevoEstado) {
        Employee emp = getOrThrow(id);
        emp.setEstado(nuevoEstado);
        return toResponse(employeeRepository.save(emp));
    }

    // ── helpers ──────────────────────────────────────────────────

    Employee getOrThrow(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Empleado no encontrado con id: " + id));
    }

    // ── private helpers ──────────────────────────────────────────

    /** Resuelve el área a partir del ID; retorna null si no se proporcionó. */
    private Area resolveArea(Long areaId) {
        if (areaId == null) return null;
        return areaRepository.findById(areaId)
                .orElseThrow(() -> new ResourceNotFoundException("Área no encontrada con id: " + areaId));
    }

    /**
     * Si hay área estructurada y no se pasó seccion explícita,
     * usa el nombre del área como seccion para mantener consistencia.
     */
    private String resolveSeccion(String seccionRequest, Area area) {
        if (seccionRequest != null && !seccionRequest.isBlank()) return seccionRequest;
        return area != null ? area.getNombre() : null;
    }

    private EmployeeResponse toResponse(Employee e) {
        // seccion: preferir el campo text si existe, si no usar el nombre del área
        String seccionDisplay = (e.getSeccion() != null && !e.getSeccion().isBlank())
                ? e.getSeccion()
                : e.getNombreArea();
        return EmployeeResponse.builder()
                .id(e.getId())
                .cedula(e.getCedula())
                .nombres(e.getNombres())
                .apellidos(e.getApellidos())
                .email(e.getEmail())
                .telefono(e.getTelefono())
                .cargo(e.getCargo())
                .seccion(seccionDisplay)
                .areaId(e.getArea() != null ? e.getArea().getId() : null)
                .areaNombre(e.getNombreArea())
                .ciudad(e.getCiudad())
                .estado(e.getEstado())
                .tipoContrato(e.getTipoContrato())
                .tipoPago(e.getTipoPago())
                .salarioBasico(e.getSalarioBasico())
                .fechaIngreso(e.getFechaIngreso())
                .fechaFinContrato(e.getFechaFinContrato())
                .ultimoDiaLaborado(e.getUltimoDiaLaborado())
                .creadoEn(e.getCreadoEn())
                .actualizadoEn(e.getActualizadoEn())
                .build();
    }
}
