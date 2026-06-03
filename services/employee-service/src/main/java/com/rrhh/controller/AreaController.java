package com.rrhh.controller;

import com.rrhh.dto.ApiResponse;
import com.rrhh.dto.AreaRequest;
import com.rrhh.dto.AreaResponse;
import com.rrhh.exception.ForbiddenException;
import com.rrhh.service.AreaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

/**
 * Endpoint base: /employees/areas
 * El gateway reescribe /api/employees/* → /employees/* en este servicio.
 *
 * GET  /employees/areas          → lista de áreas activas (pública — usada por dropdowns)
 * GET  /employees/areas/todas    → todas (activas + inactivas) — ADMIN_RRHH
 * GET  /employees/areas/{id}     → detalle
 * POST /employees/areas          → crear — ADMIN_RRHH
 * PUT  /employees/areas/{id}     → editar — ADMIN_RRHH
 * PUT  /employees/areas/{id}/toggle → activar/desactivar — ADMIN_RRHH
 */
@RestController
@RequestMapping("/employees/areas")
@RequiredArgsConstructor
public class AreaController {

    private static final String ROL_ADMIN = "ADMIN_RRHH";
    private final AreaService areaService;

    /** Áreas activas — público, sin token requerido (usado por selectores del frontend) */
    @GetMapping
    public ResponseEntity<ApiResponse<List<AreaResponse>>> getActivas() {
        return ResponseEntity.ok(ApiResponse.ok(areaService.getActivas()));
    }

    /** Todas las áreas (activas + inactivas) — requiere ADMIN_RRHH */
    @GetMapping("/todas")
    public ResponseEntity<ApiResponse<List<AreaResponse>>> getTodas(
            @RequestHeader(value = "x-user-rol", required = false) String rol) {
        requireAdmin(rol);
        return ResponseEntity.ok(ApiResponse.ok(areaService.getAll()));
    }

    /** Detalle de un área por ID */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AreaResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(areaService.getById(id)));
    }

    /** Crear nueva área — requiere ADMIN_RRHH */
    @PostMapping
    public ResponseEntity<ApiResponse<AreaResponse>> create(
            @RequestHeader(value = "x-user-rol", required = false) String rol,
            @RequestBody @Valid AreaRequest request) {
        requireAdmin(rol);
        AreaResponse created = areaService.create(request);
        return ResponseEntity
                .created(URI.create("/employees/areas/" + created.getId()))
                .body(ApiResponse.ok(created, "Área creada correctamente"));
    }

    /** Editar área — requiere ADMIN_RRHH */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AreaResponse>> update(
            @PathVariable Long id,
            @RequestHeader(value = "x-user-rol", required = false) String rol,
            @RequestBody @Valid AreaRequest request) {
        requireAdmin(rol);
        return ResponseEntity.ok(ApiResponse.ok(areaService.update(id, request), "Área actualizada"));
    }

    /** Activar/desactivar área — requiere ADMIN_RRHH */
    @PutMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<AreaResponse>> toggle(
            @PathVariable Long id,
            @RequestHeader(value = "x-user-rol", required = false) String rol) {
        requireAdmin(rol);
        return ResponseEntity.ok(ApiResponse.ok(areaService.toggleActivo(id)));
    }

    // ── helpers ──────────────────────────────────────────────────

    private void requireAdmin(String rol) {
        if (!ROL_ADMIN.equals(rol)) {
            throw new ForbiddenException("Acceso denegado: se requiere rol " + ROL_ADMIN);
        }
    }
}
