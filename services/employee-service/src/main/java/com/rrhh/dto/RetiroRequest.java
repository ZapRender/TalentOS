package com.rrhh.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RetiroRequest {

    @NotNull(message = "El último día laborado es obligatorio")
    private LocalDate ultimoDiaLaborado;

    // renuncia_voluntaria | terminacion_contrato | vencimiento_contrato
    // mutuo_acuerdo | justa_causa
    private String motivoRetiro;

    private String observaciones;
}
