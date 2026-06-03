package com.rrhh.repository;

import com.rrhh.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Optional<Employee> findByCedula(String cedula);

    boolean existsByCedula(String cedula);

    List<Employee> findByEstado(String estado);
}
