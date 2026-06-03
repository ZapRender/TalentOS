package com.rrhh.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeResponse {

    private Long id;
    private String cedula;
    private String nombres;
    private String apellidos;
    private String email;
    private String telefono;
    private String cargo;
    private String seccion;
    private Long   areaId;
    private String areaNombre;
    private String ciudad;
    private String estado;
    private String tipoContrato;
    private String tipoPago;
    private BigDecimal salarioBasico;
    private LocalDate fechaIngreso;
    private LocalDate fechaFinContrato;
    private LocalDate ultimoDiaLaborado;
    private LocalDateTime creadoEn;
    private LocalDateTime actualizadoEn;
}
