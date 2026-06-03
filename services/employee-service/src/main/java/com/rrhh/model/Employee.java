package com.rrhh.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;


@Entity
@Table(name = "employees")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String cedula;

    @Column(nullable = false, length = 100)
    private String nombres;

    @Column(nullable = false, length = 100)
    private String apellidos;

    @Column(length = 150)
    private String email;

    @Column(length = 20)
    private String telefono;

    @Column(nullable = false, length = 100)
    private String cargo;

    /** Departamento o área interna (texto libre — legacy) */
    @Column(length = 100)
    private String seccion;

    /** Relación con la tabla de áreas estructuradas */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "area_id")
    private Area area;

    /** Retorna el nombre del área estructurada, o null si no tiene asignada */
    public String getNombreArea() {
        return area != null ? area.getNombre() : null;
    }

    @Column(length = 100)
    private String ciudad;

    /**
     * activo | en_retiro | retirado
     */
    @Column(nullable = false, length = 20)
    @Builder.Default
    private String estado = "activo";

    /**
     * indefinido | termino_fijo | obra_labor | prestacion_servicios
     */
    @Column(name = "tipo_contrato", nullable = false, length = 30)
    private String tipoContrato;

    /**
     * mensual | quincenal | semanal
     */
    @Column(name = "tipo_pago", length = 20)
    private String tipoPago;

    @Column(name = "salario_basico", precision = 15, scale = 2)
    private BigDecimal salarioBasico;

    @Column(name = "fecha_ingreso", nullable = false)
    private LocalDate fechaIngreso;

    /** Solo para contratos a término fijo */
    @Column(name = "fecha_fin_contrato")
    private LocalDate fechaFinContrato;

    /** Se establece al iniciar el proceso de retiro */
    @Column(name = "ultimo_dia_laborado")
    private LocalDate ultimoDiaLaborado;

    @Column(name = "creado_en", updatable = false)
    private LocalDateTime creadoEn;

    @Column(name = "actualizado_en")
    private LocalDateTime actualizadoEn;

    @PrePersist
    void onCreate() {
        if (creadoEn == null)    creadoEn    = LocalDateTime.now();
        if (actualizadoEn == null) actualizadoEn = LocalDateTime.now();
        if (estado == null)      estado      = "activo";
    }

    @PreUpdate
    void onUpdate() {
        actualizadoEn = LocalDateTime.now();
    }
}
