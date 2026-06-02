package com.rrhh.repository;

import com.rrhh.model.Candidato;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CandidatoRepository extends JpaRepository<Candidato, Long> {

    List<Candidato> findByEtapaActual(String etapaActual);

    boolean existsByCedula(String cedula);
}
