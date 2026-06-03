package com.rrhh.repository;

import com.rrhh.model.RequerimientoPersonal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RequerimientoPersonalRepository extends JpaRepository<RequerimientoPersonal, Long> {

    List<RequerimientoPersonal> findByEstado(String estado);

    List<RequerimientoPersonal> findBySolicitanteId(Long solicitanteId);
}
