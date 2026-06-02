package com.rrhh.service;

import com.rrhh.dto.EmployeeRequest;
import com.rrhh.dto.EmployeeResponse;
import com.rrhh.exception.DuplicateResourceException;
import com.rrhh.exception.ResourceNotFoundException;
import com.rrhh.model.Employee;
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

    public List<EmployeeResponse> findAll() {
        return employeeRepository.findAll().stream().map(this::toResponse).toList();
    }

    public EmployeeResponse findById(Long id) {
        return toResponse(getEmployeeOrThrow(id));
    }

    @Transactional
    public EmployeeResponse create(EmployeeRequest request) {
        if (employeeRepository.existsByCedula(request.getCedula())) {
            throw new DuplicateResourceException(
                    "Ya existe un empleado con la cédula: " + request.getCedula());
        }
        Employee employee = new Employee();
        applyRequestToEntity(request, employee);
        return toResponse(employeeRepository.save(employee));
    }

    @Transactional
    public EmployeeResponse update(Long id, EmployeeRequest request) {
        Employee employee = getEmployeeOrThrow(id);
        if (employeeRepository.existsByCedulaAndIdNot(request.getCedula(), id)) {
            throw new DuplicateResourceException(
                    "Ya existe otro empleado con la cédula: " + request.getCedula());
        }
        applyRequestToEntity(request, employee);
        return toResponse(employeeRepository.save(employee));
    }

    private Employee getEmployeeOrThrow(Long id) {
        return employeeRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Empleado no encontrado con id: " + id));
    }

    private void applyRequestToEntity(EmployeeRequest request, Employee employee) {
        employee.setCedula(request.getCedula().trim());
        employee.setNombres(request.getNombres().trim());
        employee.setApellidos(request.getApellidos().trim());
        employee.setEmail(request.getEmail().trim().toLowerCase());
        employee.setTelefono(request.getTelefono());
        employee.setDireccion(request.getDireccion());
        employee.setCiudad(request.getCiudad());
        employee.setCargo(request.getCargo().trim());
        employee.setSeccion(request.getSeccion());
        employee.setCentroCosto(request.getCentroCosto());
        employee.setSalarioBasico(request.getSalarioBasico());
        employee.setTipoContrato(request.getTipoContrato().trim());
        employee.setTipoIngreso(request.getTipoIngreso().trim());
        employee.setEmpresaTemporal(request.getEmpresaTemporal());
        employee.setFechaIngreso(request.getFechaIngreso());
        employee.setFechaFinContrato(request.getFechaFinContrato());
        employee.setUltimoDiaLaborado(request.getUltimoDiaLaborado());
        employee.setEstado(request.getEstado() != null ? request.getEstado().trim() : "activo");
        employee.setTipoPago(
                request.getTipoPago() != null ? request.getTipoPago().trim() : "transferencia_electronica");
        employee.setNumeroCuenta(request.getNumeroCuenta());
        employee.setBanco(request.getBanco());
    }

    private EmployeeResponse toResponse(Employee employee) {
        return EmployeeResponse.builder()
                .id(employee.getId())
                .cedula(employee.getCedula())
                .nombres(employee.getNombres())
                .apellidos(employee.getApellidos())
                .email(employee.getEmail())
                .telefono(employee.getTelefono())
                .direccion(employee.getDireccion())
                .ciudad(employee.getCiudad())
                .cargo(employee.getCargo())
                .seccion(employee.getSeccion())
                .centroCosto(employee.getCentroCosto())
                .salarioBasico(employee.getSalarioBasico())
                .tipoContrato(employee.getTipoContrato())
                .tipoIngreso(employee.getTipoIngreso())
                .empresaTemporal(employee.getEmpresaTemporal())
                .fechaIngreso(employee.getFechaIngreso())
                .fechaFinContrato(employee.getFechaFinContrato())
                .ultimoDiaLaborado(employee.getUltimoDiaLaborado())
                .estado(employee.getEstado())
                .tipoPago(employee.getTipoPago())
                .numeroCuenta(employee.getNumeroCuenta())
                .banco(employee.getBanco())
                .creadoEn(employee.getCreadoEn())
                .build();
    }
}
