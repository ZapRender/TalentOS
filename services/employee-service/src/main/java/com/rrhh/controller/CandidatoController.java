package com.rrhh.controller;

import com.rrhh.dto.CandidatoRequest;
import com.rrhh.dto.CandidatoResponse;
import com.rrhh.dto.EmployeeRequest;
import com.rrhh.dto.EmployeeResponse;
import com.rrhh.service.CandidatoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/employees/candidatos")
@RequiredArgsConstructor
public class CandidatoController {

    private final CandidatoService candidatoService;

    /** GET /employees/candidatos?etapa=preseleccion */
    @GetMapping
    public ResponseEntity<List<CandidatoResponse>> getAll(
            @RequestParam(required = false) String etapa) {
        return ResponseEntity.ok(candidatoService.findAll(etapa));
    }

    /** GET /employees/candidatos/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<CandidatoResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(candidatoService.findById(id));
    }

    /** POST /employees/candidatos — registrar candidato */
    @PostMapping
    public ResponseEntity<CandidatoResponse> create(@RequestBody @Valid CandidatoRequest request) {
        CandidatoResponse created = candidatoService.create(request);
        return ResponseEntity
                .created(URI.create("/employees/candidatos/" + created.getId()))
                .body(created);
    }

    /**
     * PUT /employees/candidatos/{id}/etapa — avanzar etapa del proceso
     * Body: { "etapa": "entrevista_inicial", "observaciones": "..." }
     */
    @PutMapping("/{id}/etapa")
    public ResponseEntity<CandidatoResponse> actualizarEtapa(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String etapa = body.get("etapa");
        if (etapa == null || etapa.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        String observaciones = body.get("observaciones");
        return ResponseEntity.ok(candidatoService.actualizarEtapa(id, etapa.trim(), observaciones));
    }

    /**
     * POST /employees/candidatos/{id}/contratar — convertir candidato en empleado
     * Body: EmployeeRequest con todos los datos laborales
     */
    @PostMapping("/{id}/contratar")
    public ResponseEntity<EmployeeResponse> contratar(
            @PathVariable Long id,
            @RequestBody @Valid EmployeeRequest employeeRequest) {
        EmployeeResponse empleado = candidatoService.contratar(id, employeeRequest);
        return ResponseEntity
                .created(URI.create("/employees/" + empleado.getId()))
                .body(empleado);
    }
}
