package com.rrhh.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "candidatos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Candidato {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String cedula;

    @Column(nullable = false, length = 100)
    private String nombres;

    @Column(nullable = false, length = 100)
    private String apellidos;

    @Column(length = 150)
    private String email;

    @Column(length = 20)
    private String telefono;

    @Column(name = "cargo_aplicado", nullable = false, length = 100)
    private String cargoAplicado;

    @Column(name = "requerimiento_id")
    private Long requerimientoId;

    @Column(name = "etapa_actual", length = 50)
    @Builder.Default
    private String etapaActual = "preseleccion";

    // preseleccion | entrevista_inicial | entrevista_gerencia
    // pruebas | referencias | antecedentes | admision
    // contratado | rechazado

    @Column(name = "tipo_ingreso_definido", length = 20)
    private String tipoIngresoDefinido;

    @Column(name = "empresa_temporal", length = 100)
    private String empresaTemporal;

    @Column(name = "resultado_examen_med", length = 10)
    private String resultadoExamenMed;

    // apto | no_apto

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "fecha_registro")
    @Builder.Default
    private LocalDate fechaRegistro = LocalDate.now();

    @Column(name = "creado_en", updatable = false)
    private LocalDateTime creadoEn;

    @PrePersist
    void onCreate() {
        if (creadoEn == null) creadoEn = LocalDateTime.now();
        if (etapaActual == null) etapaActual = "preseleccion";
        if (fechaRegistro == null) fechaRegistro = LocalDate.now();
    }
}
