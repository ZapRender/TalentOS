package com.rrhh.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
    private String direccion;
    private String ciudad;
    private String cargo;
    private String seccion;
    private String centroCosto;
    private BigDecimal salarioBasico;
    private String tipoContrato;
    private String tipoIngreso;
    private String empresaTemporal;
    private LocalDate fechaIngreso;
    private LocalDate fechaFinContrato;
    private LocalDate ultimoDiaLaborado;
    private String estado;
    private String tipoPago;
    private String numeroCuenta;
    private String banco;
    private LocalDateTime creadoEn;
}
