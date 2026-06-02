package com.rrhh.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "empleados")
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

    @Column(nullable = false, length = 150)
    private String email;

    @Column(length = 20)
    private String telefono;

    @Column(columnDefinition = "TEXT")
    private String direccion;

    @Column(length = 80)
    private String ciudad;

    @Column(nullable = false, length = 100)
    private String cargo;

    @Column(length = 100)
    private String seccion;

    @Column(name = "centro_costo", length = 50)
    private String centroCosto;

    @Column(name = "salario_basico", nullable = false, precision = 12, scale = 2)
    private BigDecimal salarioBasico;

    @Column(name = "tipo_contrato", nullable = false, length = 30)
    private String tipoContrato;

    @Column(name = "tipo_ingreso", nullable = false, length = 20)
    private String tipoIngreso;

    @Column(name = "empresa_temporal", length = 100)
    private String empresaTemporal;

    @Column(name = "fecha_ingreso", nullable = false)
    private LocalDate fechaIngreso;

    @Column(name = "fecha_fin_contrato")
    private LocalDate fechaFinContrato;

    @Column(name = "ultimo_dia_laborado")
    private LocalDate ultimoDiaLaborado;

    @Column(length = 20)
    @Builder.Default
    private String estado = "activo";

    @Column(name = "tipo_pago", length = 30)
    @Builder.Default
    private String tipoPago = "transferencia_electronica";

    @Column(name = "numero_cuenta", length = 50)
    private String numeroCuenta;

    @Column(length = 80)
    private String banco;

    @Column(name = "creado_en", updatable = false)
    private LocalDateTime creadoEn;

    @PrePersist
    void onCreate() {
        if (creadoEn == null) {
            creadoEn = LocalDateTime.now();
        }
        if (estado == null) {
            estado = "activo";
        }
        if (tipoPago == null) {
            tipoPago = "transferencia_electronica";
        }
    }
}
