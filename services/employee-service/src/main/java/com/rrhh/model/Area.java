package com.rrhh.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "areas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Area {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;

    @Column(name = "creado_en", updatable = false)
    private LocalDateTime creadoEn;

    /** ID del usuario que creó el área (referencia lógica al auth-service) */
    @Column(name = "creado_por")
    private Integer creadoPor;

    @PrePersist
    void onCreate() {
        if (creadoEn == null) creadoEn = LocalDateTime.now();
        if (activo == null)   activo   = true;
    }
}
