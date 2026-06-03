package com.rrhh.service;

import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.properties.TextAlignment;
import com.rrhh.dto.CertificacionResponse;
import com.rrhh.exception.ResourceNotFoundException;
import com.rrhh.model.CertificacionLaboral;
import com.rrhh.model.Employee;
import com.rrhh.repository.CertificacionLaboralRepository;
import com.rrhh.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CertificacionService {

    private static final DateTimeFormatter FMT      = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter FMT_HORA = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final List<String> TIPOS_VALIDOS = List.of("basica", "con_salario", "retiro");

    private final EmployeeRepository            employeeRepository;
    private final CertificacionLaboralRepository certRepository;

    /**
     * Genera el PDF de la certificación laboral, guarda el registro en BD y retorna el PDF.
     * @param id          ID del empleado
     * @param tipo        basica | con_salario | retiro
     * @param generadoPor ID del usuario que solicita (hasta Sprint 2 se pasa como param)
     */
    @Transactional
    public byte[] generarCertificacion(Long id, String tipo, Long generadoPor) {
        if (!TIPOS_VALIDOS.contains(tipo)) {
            throw new IllegalArgumentException(
                    "Tipo inválido: '" + tipo + "'. Permitidos: " + TIPOS_VALIDOS);
        }

        Employee emp = getOrThrow(id);
        byte[] pdf   = buildPdf(emp, tipo);

        // Guardar registro histórico en BD
        CertificacionLaboral cert = CertificacionLaboral.builder()
                .empleadoId(id)
                .tipo(tipo)
                .generadoPor(generadoPor)
                .estadoEmpleado(emp.getEstado())
                .build();
        certRepository.save(cert);

        log.info("Certificación '{}' generada para empleado id={}", tipo, id);
        return pdf;
    }

    /** Retorna el historial de certificaciones de un empleado. */
    public List<CertificacionResponse> historial(Long id) {
        // Verificar que el empleado existe
        getOrThrow(id);
        return certRepository
                .findByEmpleadoIdOrderByFechaGeneracionDesc(id)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ── PDF builder ──────────────────────────────────────────────

    private byte[] buildPdf(Employee emp, String tipo) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter   writer = new PdfWriter(baos);
            PdfDocument pdf    = new PdfDocument(writer);
            Document    doc    = new Document(pdf);

            PdfFont bold   = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            PdfFont normal = PdfFontFactory.createFont(StandardFonts.HELVETICA);
            PdfFont italic = PdfFontFactory.createFont(StandardFonts.HELVETICA_OBLIQUE);

            String hoy    = LocalDate.now().format(FMT);
            String ciudad = emp.getCiudad() != null ? emp.getCiudad() : "Ciudad";

            // ── Título ───────────────────────────────────────────
            doc.add(new Paragraph("CERTIFICACIÓN LABORAL")
                    .setFont(bold).setFontSize(16)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(4));

            String subtitulo = switch (tipo) {
                case "con_salario" -> "Con constancia de salario";
                case "retiro"      -> "Certificado de retiro";
                default            -> "Certificado básico";
            };
            doc.add(new Paragraph(subtitulo)
                    .setFont(italic).setFontSize(11)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20));

            // ── Lugar y fecha ────────────────────────────────────
            doc.add(new Paragraph(ciudad + ", " + hoy)
                    .setFont(normal).setFontSize(11)
                    .setTextAlignment(TextAlignment.RIGHT)
                    .setMarginBottom(20));

            // ── Cuerpo ───────────────────────────────────────────
            String nombre = emp.getNombres() + " " + emp.getApellidos();

            // Párrafo principal — aplica a todos los tipos
            String cuerpo = String.format(
                    "La empresa certifica que el(la) señor(a) %s, identificado(a) con " +
                    "cédula de ciudadanía N.° %s, %s en nuestra organización en el cargo " +
                    "de %s%s, con fecha de ingreso el %s.",
                    nombre,
                    emp.getCedula(),
                    "retirado".equals(emp.getEstado()) ? "prestó sus servicios" : "presta sus servicios",
                    emp.getCargo(),
                    emp.getSeccion() != null ? " — " + emp.getSeccion() : "",
                    emp.getFechaIngreso().format(FMT)
            );
            doc.add(new Paragraph(cuerpo)
                    .setFont(normal).setFontSize(11)
                    .setMarginBottom(12));

            // Párrafo de salario — solo para tipo "con_salario"
            if ("con_salario".equals(tipo)) {
                doc.add(new Paragraph(String.format(
                        "El salario básico mensual devengado es de %s, en modalidad de pago %s.",
                        formatCurrency(emp.getSalarioBasico()),
                        emp.getTipoPago() != null ? emp.getTipoPago().replace("_", " ") : "transferencia electrónica"))
                        .setFont(normal).setFontSize(11)
                        .setMarginBottom(12));
            }

            // Párrafo de retiro — solo para tipo "retiro"
            if ("retiro".equals(tipo) && emp.getUltimoDiaLaborado() != null) {
                doc.add(new Paragraph(String.format(
                        "El último día laborado fue el %s.",
                        emp.getUltimoDiaLaborado().format(FMT)))
                        .setFont(normal).setFontSize(11)
                        .setMarginBottom(12));
            }

            doc.add(new Paragraph(
                    "La presente certificación se expide a solicitud del interesado para los fines que estime convenientes.")
                    .setFont(normal).setFontSize(11)
                    .setMarginBottom(30));

            // ── Firma ────────────────────────────────────────────
            doc.add(new Paragraph("Atentamente,")
                    .setFont(normal).setFontSize(11));
            doc.add(new Paragraph("\n\n__________________________________")
                    .setFont(normal).setFontSize(11));
            doc.add(new Paragraph("Recursos Humanos")
                    .setFont(bold).setFontSize(11));

            // ── Pie de página ────────────────────────────────────
            doc.add(new Paragraph("\n\nDocumento generado el: " + LocalDateTime.now().format(FMT_HORA))
                    .setFont(italic).setFontSize(9)
                    .setTextAlignment(TextAlignment.RIGHT));

            doc.close();
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("Error generando PDF de certificación para empleado id={}", emp.getId(), e);
            throw new RuntimeException("Error generando el PDF: " + e.getMessage(), e);
        }
    }

    // ── helpers ──────────────────────────────────────────────────

    private Employee getOrThrow(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Empleado no encontrado con id: " + id));
    }

    private String formatCurrency(java.math.BigDecimal value) {
        if (value == null) return "$0";
        return String.format("$%,.0f", value);
    }

    private CertificacionResponse toResponse(CertificacionLaboral c) {
        return CertificacionResponse.builder()
                .id(c.getId())
                .empleadoId(c.getEmpleadoId())
                .tipo(c.getTipo())
                .fechaGeneracion(c.getFechaGeneracion())
                .generadoPor(c.getGeneradoPor())
                .estadoEmpleado(c.getEstadoEmpleado())
                .build();
    }
}
