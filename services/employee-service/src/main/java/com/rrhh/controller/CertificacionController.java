package com.rrhh.controller;

import com.rrhh.dto.CertificacionResponse;
import com.rrhh.service.CertificacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/employees")
@RequiredArgsConstructor
public class CertificacionController {

    private final CertificacionService certificacionService;

    /**
     * GET /employees/{id}/certificacion-laboral?tipo=basica&generadoPor=1
     * Genera el PDF y guarda el registro. Descarga directa.
     * Tipos: basica | con_salario | retiro
     */
    @GetMapping("/{id}/certificacion-laboral")
    public ResponseEntity<byte[]> generarCertificacion(
            @PathVariable Long id,
            @RequestParam(defaultValue = "basica") String tipo,
            @RequestParam(defaultValue = "1") Long generadoPor) {

        byte[] pdf = certificacionService.generarCertificacion(id, tipo, generadoPor);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"certificacion-" + tipo + "-" + id + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    /**
     * GET /employees/{id}/certificaciones
     * Retorna el historial de certificaciones generadas para el empleado.
     */
    @GetMapping("/{id}/certificaciones")
    public ResponseEntity<List<CertificacionResponse>> historial(@PathVariable Long id) {
        return ResponseEntity.ok(certificacionService.historial(id));
    }
}
