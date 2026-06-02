package com.rrhh.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RequerimientoResponse {

    private Long id;
    private String cargo;
    private String perfilRequerido;
    private Integer numeroVacantes;
    private LocalDate fechaSolicitud;
    private Long solicitanteId;
    private String estado;
    private LocalDateTime creadoEn;
}
