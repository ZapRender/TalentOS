package com.rrhh.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidatoRequest {

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

    @NotBlank(message = "El cargo aplicado es obligatorio")
    @Size(max = 100)
    private String cargoAplicado;

    private Long requerimientoId;

    @Size(max = 20)
    private String tipoIngresoDefinido;

    @Size(max = 100)
    private String empresaTemporal;

    private String observaciones;

    public void normalize() {
        cedula      = trim(cedula);
        nombres     = trim(nombres);
        apellidos   = trim(apellidos);
        cargoAplicado = trim(cargoAplicado);
        telefono    = trim(telefono);
        observaciones = trim(observaciones);
        tipoIngresoDefinido = trim(tipoIngresoDefinido);
        empresaTemporal = trim(empresaTemporal);
        if (email != null) email = email.trim().toLowerCase();
    }

    private static String trim(String v) {
        if (v == null) return null;
        String t = v.trim();
        return t.isEmpty() ? null : t;
    }
}
