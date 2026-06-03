package com.rrhh.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "certificaciones_laborales")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CertificacionLaboral {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "empleado_id", nullable = false)
    private Long empleadoId;

    @Column(nullable = false, length = 50)
    private String tipo;
    // basica | con_salario | retiro

    @Column(name = "fecha_generacion", updatable = false)
    private LocalDateTime fechaGeneracion;

    @Column(name = "generado_por", nullable = false)
    private Long generadoPor;

    @Column(name = "estado_empleado", nullable = false, length = 20)
    private String estadoEmpleado;

    @PrePersist
    void onCreate() {
        if (fechaGeneracion == null) fechaGeneracion = LocalDateTime.now();
    }
}
