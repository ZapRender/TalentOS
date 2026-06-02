package com.rrhh.service;

import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.rrhh.dto.RetiroRequest;
import com.rrhh.exception.ResourceNotFoundException;
import com.rrhh.model.Employee;
import com.rrhh.repository.EmployeeRepository;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RetiroService {

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final EmployeeRepository employeeRepository;
    private final Validator validator;

    /**
     * Inicia el proceso de retiro del empleado.
     * Cambia estado a "en_retiro" y registra el último día laborado.
     */
    @Transactional
    public Map<String, Object> iniciarRetiro(Long id, RetiroRequest request) {
        Set<ConstraintViolation<RetiroRequest>> violations = validator.validate(request);
        if (!violations.isEmpty()) throw new ConstraintViolationException(violations);

        Employee emp = getOrThrow(id);

        if ("retirado".equals(emp.getEstado())) {
            throw new IllegalStateException("El empleado ya fue retirado.");
        }

        emp.setEstado("en_retiro");
        emp.setUltimoDiaLaborado(request.getUltimoDiaLaborado());
        employeeRepository.save(emp);

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", true);
        resp.put("message", "Proceso de retiro iniciado correctamente.");
        resp.put("empleadoId", id);
        resp.put("nombreCompleto", emp.getNombres() + " " + emp.getApellidos());
        resp.put("ultimoDiaLaborado", request.getUltimoDiaLaborado().format(FMT));
        resp.put("estadoActual", "en_retiro");
        return resp;
    }

    /**
     * Genera la carta de no renovación de contrato en PDF.
     * Retorna el PDF como byte[].
     */
    public byte[] generarCartaNoRenovacion(Long id) {
        Employee emp = getOrThrow(id);

        if (!"termino_fijo".equals(emp.getTipoContrato())) {
            throw new IllegalStateException(
                    "La carta de no renovación aplica solo para contratos a término fijo. " +
                    "Tipo actual: " + emp.getTipoContrato());
        }

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document doc = new Document(pdf);

            PdfFont bold   = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            PdfFont normal = PdfFontFactory.createFont(StandardFonts.HELVETICA);

            String hoy = LocalDate.now().format(FMT);
            String ciudad = emp.getCiudad() != null ? emp.getCiudad() : "Ciudad";

            // Encabezado
            doc.add(new Paragraph("CARTA DE NO RENOVACIÓN DE CONTRATO")
                    .setFont(bold).setFontSize(14)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20));

            // Lugar y fecha
            doc.add(new Paragraph(ciudad + ", " + hoy)
                    .setFont(normal).setFontSize(11)
                    .setTextAlignment(TextAlignment.RIGHT)
                    .setMarginBottom(15));

            // Destinatario
            doc.add(new Paragraph("Señor(a):")
                    .setFont(bold).setFontSize(11));
            doc.add(new Paragraph(emp.getNombres() + " " + emp.getApellidos())
                    .setFont(normal).setFontSize(11));
            doc.add(new Paragraph("C.C. " + emp.getCedula())
                    .setFont(normal).setFontSize(11));
            doc.add(new Paragraph("Cargo: " + emp.getCargo())
                    .setFont(normal).setFontSize(11).setMarginBottom(20));

            // Cuerpo
            String fechaFin = emp.getFechaFinContrato() != null
                    ? emp.getFechaFinContrato().format(FMT) : "[fecha fin de contrato]";
            String ultimoDia = emp.getUltimoDiaLaborado() != null
                    ? emp.getUltimoDiaLaborado().format(FMT) : fechaFin;

            doc.add(new Paragraph(
                    "Por medio de la presente, le comunicamos que la empresa ha tomado " +
                    "la decisión de NO RENOVAR el contrato de trabajo a término fijo " +
                    "suscrito con usted, el cual vence el día " + fechaFin + ".")
                    .setFont(normal).setFontSize(11).setMarginBottom(12));

            doc.add(new Paragraph(
                    "En consecuencia, su último día de labores será el " + ultimoDia + ". " +
                    "Le agradecemos su dedicación y compromiso durante el tiempo que " +
                    "hizo parte de nuestra organización.")
                    .setFont(normal).setFontSize(11).setMarginBottom(12));

            doc.add(new Paragraph(
                    "El área de Recursos Humanos se comunicará con usted para coordinar " +
                    "el proceso de entrega de elementos, paz y salvo y demás trámites " +
                    "correspondientes al proceso de desvinculación.")
                    .setFont(normal).setFontSize(11).setMarginBottom(30));

            // Firma
            doc.add(new Paragraph("Atentamente,")
                    .setFont(normal).setFontSize(11));
            doc.add(new Paragraph("\n\n__________________________________")
                    .setFont(normal).setFontSize(11));
            doc.add(new Paragraph("Recursos Humanos")
                    .setFont(bold).setFontSize(11));

            doc.close();
            log.info("Carta de no renovación generada para empleado id={}", id);
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("Error generando carta de no renovación para empleado id={}", id, e);
            throw new RuntimeException("Error generando el PDF: " + e.getMessage(), e);
        }
    }

    /**
     * Retorna el checklist de devolución de implementos al momento del retiro.
     */
    public Map<String, Object> getChecklistRetiro(Long id) {
        Employee emp = getOrThrow(id);

        Map<String, Object> checklist = new LinkedHashMap<>();
        checklist.put("empleadoId", id);
        checklist.put("nombreCompleto", emp.getNombres() + " " + emp.getApellidos());
        checklist.put("cargo", emp.getCargo());
        checklist.put("cedula", emp.getCedula());
        checklist.put("ultimoDiaLaborado",
                emp.getUltimoDiaLaborado() != null
                        ? emp.getUltimoDiaLaborado().format(FMT) : "Por definir");

        // Items del checklist con su estado (pendiente por defecto)
        Map<String, String> items = new LinkedHashMap<>();
        items.put("carnet_empresa",           "pendiente");
        items.put("computador_equipo",        "pendiente");
        items.put("celular_corporativo",      "pendiente");
        items.put("llaves_acceso",            "pendiente");
        items.put("dotacion_uniforme",        "pendiente");
        items.put("herramientas_asignadas",   "pendiente");
        items.put("paz_salvo_sistemas",       "pendiente");
        items.put("paz_salvo_almacen",        "pendiente");
        items.put("paz_salvo_nomina",         "pendiente");
        items.put("entrega_cargo_documentos", "pendiente");
        items.put("encuesta_salida",          "pendiente");

        checklist.put("items", items);
        checklist.put("observaciones", "Todos los ítems deben ser firmados por el jefe directo y RRHH.");
        return checklist;
    }

    // ── helpers ──────────────────────────────────────────────────

    private Employee getOrThrow(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Empleado no encontrado con id: " + id));
    }
}
