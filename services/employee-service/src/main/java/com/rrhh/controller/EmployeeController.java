package com.rrhh.controller;

import com.rrhh.dto.EmployeeRequest;
import com.rrhh.dto.EmployeeResponse;
import com.rrhh.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    /** GET /employees?estado=activo */
    @GetMapping
    public ResponseEntity<List<EmployeeResponse>> getAll(
            @RequestParam(required = false) String estado) {
        return ResponseEntity.ok(employeeService.findAll(estado));
    }

    /** GET /employees/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<EmployeeResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(employeeService.findById(id));
    }

    /** POST /employees */
    @PostMapping
    public ResponseEntity<EmployeeResponse> create(
            @RequestBody @Valid EmployeeRequest request) {
        EmployeeResponse created = employeeService.create(request);
        return ResponseEntity
                .created(URI.create("/employees/" + created.getId()))
                .body(created);
    }

    /** PUT /employees/{id} */
    @PutMapping("/{id}")
    public ResponseEntity<EmployeeResponse> update(
            @PathVariable Long id,
            @RequestBody @Valid EmployeeRequest request) {
        return ResponseEntity.ok(employeeService.update(id, request));
    }

    /** PATCH /employees/{id}/estado — Body: { "estado": "retirado" } */
    @PatchMapping("/{id}/estado")
    public ResponseEntity<EmployeeResponse> updateEstado(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String estado = body.get("estado");
        if (estado == null || estado.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(employeeService.updateEstado(id, estado.trim()));
    }
}
