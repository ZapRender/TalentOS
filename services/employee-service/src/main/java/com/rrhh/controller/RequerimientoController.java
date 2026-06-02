package com.rrhh.controller;

import com.rrhh.dto.RequerimientoRequest;
import com.rrhh.dto.RequerimientoResponse;
import com.rrhh.service.RequerimientoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/employees/requerimientos")
@RequiredArgsConstructor
public class RequerimientoController {

    private final RequerimientoService requerimientoService;

    /** GET /employees/requerimientos?estado=abierto */
    @GetMapping
    public ResponseEntity<List<RequerimientoResponse>> getAll(
            @RequestParam(required = false) String estado) {
        return ResponseEntity.ok(requerimientoService.findAll(estado));
    }

    /** GET /employees/requerimientos/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<RequerimientoResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(requerimientoService.findById(id));
    }

    /** POST /employees/requerimientos — crear requerimiento */
    @PostMapping
    public ResponseEntity<RequerimientoResponse> create(
            @RequestBody @Valid RequerimientoRequest request) {
        RequerimientoResponse created = requerimientoService.create(request);
        return ResponseEntity
                .created(URI.create("/employees/requerimientos/" + created.getId()))
                .body(created);
    }

    /** PUT /employees/requerimientos/{id} — editar datos del requerimiento */
    @PutMapping("/{id}")
    public ResponseEntity<RequerimientoResponse> update(
            @PathVariable Long id,
            @RequestBody @Valid RequerimientoRequest request) {
        return ResponseEntity.ok(requerimientoService.update(id, request));
    }

    /**
     * PATCH /employees/requerimientos/{id}/estado — cambiar estado
     * Body: { "estado": "en_proceso" }
     */
    @PatchMapping("/{id}/estado")
    public ResponseEntity<RequerimientoResponse> cambiarEstado(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String estado = body.get("estado");
        if (estado == null || estado.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(requerimientoService.cambiarEstado(id, estado.trim()));
    }
}
