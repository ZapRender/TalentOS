package com.rrhh.controller;

import com.rrhh.dto.RetiroRequest;
import com.rrhh.service.RetiroService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/employees")
@RequiredArgsConstructor
public class RetiroController {

    private final RetiroService retiroService;

    /**
     * POST /employees/{id}/retiro
     * Inicia el proceso de retiro: cambia estado a "en_retiro" y registra el último día laborado.
     * Body: { "ultimoDiaLaborado": "2025-08-31", "motivoRetiro": "vencimiento_contrato" }
     */
    @PostMapping("/{id}/retiro")
    public ResponseEntity<Map<String, Object>> iniciarRetiro(
            @PathVariable Long id,
            @RequestBody @Valid RetiroRequest request) {
        return ResponseEntity.ok(retiroService.iniciarRetiro(id, request));
    }

    /**
     * GET /employees/{id}/carta-no-renovacion
     * Genera y descarga la carta de no renovación en PDF.
     * Solo aplica para contratos a término fijo.
     */
    @GetMapping("/{id}/carta-no-renovacion")
    public ResponseEntity<byte[]> cartaNoRenovacion(@PathVariable Long id) {
        byte[] pdf = retiroService.generarCartaNoRenovacion(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"carta-no-renovacion-" + id + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    /**
     * GET /employees/{id}/checklist-retiro
     * Retorna el checklist de devolución de implementos al momento del retiro.
     */
    @GetMapping("/{id}/checklist-retiro")
    public ResponseEntity<Map<String, Object>> checklistRetiro(@PathVariable Long id) {
        return ResponseEntity.ok(retiroService.getChecklistRetiro(id));
    }
}
