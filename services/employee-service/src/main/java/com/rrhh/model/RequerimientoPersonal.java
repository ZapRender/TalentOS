package com.rrhh.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "requerimientos_personal")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RequerimientoPersonal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String cargo;

    @Column(name = "perfil_requerido", nullable = false, columnDefinition = "TEXT")
    private String perfilRequerido;

    @Column(name = "numero_vacantes")
    @Builder.Default
    private Integer numeroVacantes = 1;

    @Column(name = "fecha_solicitud", nullable = false)
    @Builder.Default
    private LocalDate fechaSolicitud = LocalDate.now();

    @Column(name = "solicitante_id", nullable = false)
    private Long solicitanteId;

    @Column(length = 30)
    @Builder.Default
    private String estado = "abierto";
    // abierto | en_proceso | cubierto | cancelado

    @Column(name = "creado_en", updatable = false)
    private LocalDateTime creadoEn;

    @PrePersist
    void onCreate() {
        if (creadoEn == null) creadoEn = LocalDateTime.now();
        if (estado == null) estado = "abierto";
        if (fechaSolicitud == null) fechaSolicitud = LocalDate.now();
        if (numeroVacantes == null) numeroVacantes = 1;
    }
}
