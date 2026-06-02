package com.rrhh.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RequerimientoRequest {

    @NotBlank(message = "El cargo es obligatorio")
    @Size(max = 100)
    private String cargo;

    @NotBlank(message = "El perfil requerido es obligatorio")
    private String perfilRequerido;

    @Min(value = 1, message = "Debe haber al menos 1 vacante")
    private Integer numeroVacantes;

    @NotNull(message = "El ID del solicitante es obligatorio")
    private Long solicitanteId;

    public void normalize() {
        if (cargo != null) cargo = cargo.trim();
        if (perfilRequerido != null) perfilRequerido = perfilRequerido.trim();
        if (numeroVacantes == null) numeroVacantes = 1;
    }
}
