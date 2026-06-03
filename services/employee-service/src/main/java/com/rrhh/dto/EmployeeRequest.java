package com.rrhh.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeRequest {

    @NotBlank(message = "La cédula es obligatoria")
    @Size(min = 5, max = 20)
    @Pattern(regexp = "^[0-9]+$", message = "La cédula debe contener solo dígitos")
    private String cedula;

    @NotBlank(message = "Los nombres son obligatorios")
    @Size(min = 2, max = 100)
    private String nombres;

    @NotBlank(message = "Los apellidos son obligatorios")
    @Size(min = 2, max = 100)
    private String apellidos;

    @Email(message = "El email no es válido")
    @Size(max = 150)
    private String email;

    @Size(max = 20)
    private String telefono;

    @NotBlank(message = "El cargo es obligatorio")
    @Size(max = 100)
    private String cargo;

    @Size(max = 100)
    private String seccion;

    /** ID del área estructurada (opcional — si se envía, se vincula el empleado al área) */
    private Long areaId;

    @Size(max = 100)
    private String ciudad;

    @NotBlank(message = "El tipo de contrato es obligatorio")
    private String tipoContrato;

    private String tipoPago;

    @NotNull(message = "El salario básico es obligatorio")
    @Positive(message = "El salario debe ser positivo")
    private BigDecimal salarioBasico;

    @NotNull(message = "La fecha de ingreso es obligatoria")
    private LocalDate fechaIngreso;

    private LocalDate fechaFinContrato;

    public void normalize() {
        if (cedula    != null) cedula    = cedula.trim();
        if (nombres   != null) nombres   = nombres.trim();
        if (apellidos != null) apellidos = apellidos.trim();
        if (cargo     != null) cargo     = cargo.trim();
        if (seccion   != null) seccion   = seccion.trim();
        if (ciudad    != null) ciudad    = ciudad.trim();
        if (email     != null) email     = email.trim().toLowerCase();
        if (tipoContrato != null) tipoContrato = tipoContrato.trim();
    }
}
