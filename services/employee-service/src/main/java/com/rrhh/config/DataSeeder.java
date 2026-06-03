package com.rrhh.config;

import com.rrhh.model.Area;
import com.rrhh.repository.AreaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final AreaRepository areaRepository;

    private static final List<String> DEFAULT_AREAS = List.of(
            "Recursos Humanos",
            "Contabilidad y Finanzas",
            "Operaciones",
            "Tecnología",
            "Comercial y Ventas",
            "Gerencia General",
            "Logística",
            "Servicio al Cliente",
            "Jurídico",
            "Salud Ocupacional"
    );

    @Override
    public void run(String... args) {
        if (areaRepository.count() == 0) {
            log.info("[DataSeeder] Insertando {} áreas por defecto...", DEFAULT_AREAS.size());
            DEFAULT_AREAS.forEach(nombre ->
                    areaRepository.save(Area.builder().nombre(nombre).activo(true).build())
            );
            log.info("[DataSeeder] Áreas insertadas correctamente.");
        } else {
            log.debug("[DataSeeder] Tabla de áreas ya contiene datos, omitiendo seed.");
        }
    }
}
