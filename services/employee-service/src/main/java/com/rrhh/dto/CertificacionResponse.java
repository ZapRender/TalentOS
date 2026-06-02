package com.rrhh.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CertificacionResponse {

    private Long id;
    private Long empleadoId;
    private String tipo;
    private LocalDateTime fechaGeneracion;
    private Long generadoPor;
    private String estadoEmpleado;
}
