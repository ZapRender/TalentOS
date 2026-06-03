package com.rrhh.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidatoResponse {

    private Long id;
    private String cedula;
    private String nombres;
    private String apellidos;
    private String email;
    private String telefono;
    private String cargoAplicado;
    private Long requerimientoId;
    private String etapaActual;
    private String tipoIngresoDefinido;
    private String empresaTemporal;
    private String resultadoExamenMed;
    private String observaciones;
    private LocalDate fechaRegistro;
    private LocalDateTime creadoEn;
}
