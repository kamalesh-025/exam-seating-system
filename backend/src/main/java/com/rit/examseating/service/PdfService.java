package com.rit.examseating.service;
 
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.pdf.*;
import com.itextpdf.layout.*;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.*;
import com.rit.examseating.entity.*;
import com.rit.examseating.repository.SeatingArrangementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;
 
@Service
@RequiredArgsConstructor
public class PdfService {
 
    private final SeatingArrangementRepository seatingRepo;
 
    public byte[] generateSeatingPdf(LocalDate examDate) throws Exception {
        List<SeatingArrangement> arrangements = seatingRepo.findByExamDate(examDate);
        if (arrangements.isEmpty()) throw new RuntimeException("No arrangements for date: " + examDate);
 
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(out);
        PdfDocument pdf = new PdfDocument(writer);
        Document doc = new Document(pdf);
 
        // Title
        Paragraph title = new Paragraph("RAJALAKSHMI INSTITUTE OF TECHNOLOGY")
            .setBold().setFontSize(16).setTextAlignment(TextAlignment.CENTER);
        doc.add(title);
 
        Paragraph subtitle = new Paragraph("Exam Seating Arrangement")
            .setFontSize(13).setTextAlignment(TextAlignment.CENTER);
        doc.add(subtitle);
 
        Paragraph dateP = new Paragraph("Exam Date: " + examDate.toString())
            .setFontSize(11).setTextAlignment(TextAlignment.CENTER);
        doc.add(dateP);
 
        doc.add(new Paragraph("\n"));
 
        // Group by room
        Map<String, List<SeatingArrangement>> roomGrouped = arrangements.stream()
            .collect(Collectors.groupingBy(a -> a.getRoom().getRoomNumber()));
 
        // Sort rooms alphabetically
        new TreeMap<>(roomGrouped).forEach((roomNo, seats) -> {
            Room room = seats.get(0).getRoom();
 
            // Room header
            Paragraph roomHeader = new Paragraph(
                "Block " + room.getBlock().getBlockName() +
                " | Floor " + room.getFloorNumber() +
                " | Room " + room.getRoomNumber() +
                " | Capacity: " + room.getCapacity()
            ).setBold().setFontSize(12).setBackgroundColor(ColorConstants.LIGHT_GRAY).setPadding(5);
            doc.add(roomHeader);
 
            // Table
            Table table = new Table(UnitValue.createPercentArray(new float[]{1, 2, 3, 2, 2}))
                .setWidth(UnitValue.createPercentValue(100));
 
            // Header row
            table.addHeaderCell(headerCell("Seat No."));
            table.addHeaderCell(headerCell("Register No."));
            table.addHeaderCell(headerCell("Student Name"));
            table.addHeaderCell(headerCell("Department"));
            table.addHeaderCell(headerCell("Course Code"));
 
            seats.sort(Comparator.comparing(SeatingArrangement::getSeatNumber));
            for (SeatingArrangement s : seats) {
                table.addCell(s.getSeatNumber());
                table.addCell(s.getStudent().getRegisterNumber());
                table.addCell(s.getStudent().getStudentName());
                table.addCell(s.getStudent().getDepartment());
                table.addCell(s.getStudent().getCourseCode());
            }
 
            doc.add(table);
            doc.add(new Paragraph("\n"));
        });
 
        doc.close();
        return out.toByteArray();
    }
 
    private Cell headerCell(String text) {
        return new Cell()
            .add(new Paragraph(text).setBold())
            .setBackgroundColor(ColorConstants.DARK_GRAY)
            .setFontColor(ColorConstants.WHITE)
            .setTextAlignment(TextAlignment.CENTER);
    }
}