package com.rrhh.repository;

import com.rrhh.model.CertificacionLaboral;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CertificacionLaboralRepository extends JpaRepository<CertificacionLaboral, Long> {

    List<CertificacionLaboral> findByEmpleadoIdOrderByFechaGeneracionDesc(Long empleadoId);
}
