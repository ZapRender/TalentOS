package com.rrhh.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeRequest {

    @NotBlank(message = "La cédula es obligatoria")
    @Size(max = 20, message = "La cédula no puede superar 20 caracteres")
    private String cedula;

    @NotBlank(message = "Los nombres son obligatorios")
    @Size(max = 100)
    private String nombres;

    @NotBlank(message = "Los apellidos son obligatorios")
    @Size(max = 100)
    private String apellidos;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email no es válido")
    @Size(max = 150)
    private String email;

    @Size(max = 20)
    private String telefono;

    private String direccion;

    @Size(max = 80)
    private String ciudad;

    @NotBlank(message = "El cargo es obligatorio")
    @Size(max = 100)
    private String cargo;

    @Size(max = 100)
    private String seccion;

    @Size(max = 50)
    private String centroCosto;

    @NotNull(message = "El salario básico es obligatorio")
    @DecimalMin(value = "0.0", inclusive = false, message = "El salario básico debe ser mayor a cero")
    private BigDecimal salarioBasico;

    @NotBlank(message = "El tipo de contrato es obligatorio")
    @Size(max = 30)
    private String tipoContrato;

    @NotBlank(message = "El tipo de ingreso es obligatorio")
    @Size(max = 20)
    private String tipoIngreso;

    @Size(max = 100)
    private String empresaTemporal;

    @NotNull(message = "La fecha de ingreso es obligatoria")
    private LocalDate fechaIngreso;

    private LocalDate fechaFinContrato;

    private LocalDate ultimoDiaLaborado;

    @Size(max = 20)
    private String estado;

    @Size(max = 30)
    private String tipoPago;

    @Size(max = 50)
    private String numeroCuenta;

    @Size(max = 80)
    private String banco;
}
